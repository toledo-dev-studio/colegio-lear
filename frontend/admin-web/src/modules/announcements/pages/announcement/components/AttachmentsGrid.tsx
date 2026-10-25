import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { AttachmentCard } from "@/shared/components/attachment-card/AttachmentCard";
import { promisePool } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { extractFileExtension } from "@/lib/extensions/attachments";
import { DragAndDrop } from "@/shared/components/drag-and-drop/DragAndDrop";
import { DEFAULT_ACCEPTED_FILE_EXTENSIONS, DEFAULT_IMAGE_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "@/lib/constants/attachment.constants";
import { useDeleteAttachmentForAnnouncementById } from "@/modules/announcements/hooks/attachments/useDeleteAttachmentForAnnouncementById";
import { useUploadAttachmentForAnnouncement } from "@/modules/announcements/hooks/attachments/useUploadAttachmentForAnnouncement";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

/**
 * Attachments — owner of all attachment business logic for announcement.
 *
 * Responsibilities:
 *  - Wraps the decoupled <DragAndDrop /> (visual only)
 *  - Validates files (extension whitelist, max size 10MB, duplicates)
 *  - Triggers the (simulated) upload service
 *  - Holds per-file uploading/deleting UI state
 *  - Renders the responsive grid of attachments
 *  - Handles delete with simulated async + optimistic UI
 *  - Handles copy-URL with clipboard + toast
 *  - Drives React Hook Form via value/onChange (controlled)
 */
interface UploadAttachment {
    id: string;
    name: string;
    extension: string;
    previewUrl?: string;
    file: File;
}

interface Props {
    announcementId: string;
    attachments: AttachmentResponse[];
    acceptedExtensions?: readonly string[];
    /** Handle actions */
    onChange: (
        next:
            | AttachmentResponse[]
            | ((prev: AttachmentResponse[]) => AttachmentResponse[])
    ) => void;
}

export const AttachmentsGrid = ({ announcementId, attachments, acceptedExtensions = DEFAULT_ACCEPTED_FILE_EXTENSIONS, onChange }: Props) => {
    // Coomponent hooks & stores
    const [uploadingAttachments, setUploadingAttachments] = useState<UploadAttachment[]>([]);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const deleteAttachmentByIdMutation = useDeleteAttachmentForAnnouncementById();
    const uploadAttachmentMutation = useUploadAttachmentForAnnouncement();
    const disabled = uploadAttachmentMutation.isPending || deleteAttachmentByIdMutation.isPending;

    // Revoke object URLs on unmount to avoid leaks
    useEffect(() => {
        return () => {
            uploadingAttachments.forEach((u) => u.previewUrl && URL.revokeObjectURL(u.previewUrl))
        }
    }, []);

    /**
     * Event to detect if any file is duplicated by name.
     */
    const hasDuplicateName = useCallback((file: File): boolean => {
        return attachments.some(
            (a) => a.name.toLowerCase() === file.name.toLowerCase().split(".")[0]
        );
    }, [attachments],);

    /**
     * Event handler executed when files where selected.
     * Validate an upload files to server generating a public url. 
     */
    const handleOnFilesSelected = useCallback(async (files: File[]) => {
        if (disabled)
            return;

        const attachmentsToUpload: UploadAttachment[] = [];

        for (const file of files) {
            const fileExtension = extractFileExtension(file.name);

            // File has an invalid extension?
            if (!(acceptedExtensions.map((e) => e.toLowerCase()).includes(`.${fileExtension}`.toLowerCase()))) {
                toast.error(`El archivo "${file.name}" no cuenta con un formato válido.`, { position: "top-right" });
                return;
            }

            // File size is bigger than available size?
            if (file.size > MAX_FILE_SIZE_BYTES) {
                toast.error(`El archivo "${file.name}" supera el límite de 10MB.`, { position: "top-right" });
                return;
            }

            // A file with same name already exists?
            if (hasDuplicateName(file)) {
                toast.error(`Ya se encuentra cargado un archivo con el nombre "${file.name}".`, { position: "top-right" });
                return;
            }

            const isImage = DEFAULT_IMAGE_EXTENSIONS.includes(`.${fileExtension}`.toLowerCase());

            attachmentsToUpload.push({
                id: generateTemporalId(),
                name: file.name,
                extension: fileExtension,
                previewUrl: isImage ? URL.createObjectURL(file) : undefined,
                file: file
            });
        }

        if (attachmentsToUpload.length == 0)
            return;

        // Show all uploading skeletons immediately
        setUploadingAttachments((prev) => [...prev, ...attachmentsToUpload]);

        // Process uploads in parallel in pool of 3 requests; each finishes independently
        await promisePool(attachmentsToUpload, 3, async ({ id, name, previewUrl, file }) => {
            try {
                const attachment = await uploadAttachmentMutation.mutateAsync({ announcementId, file });
                onChange((prev) => [...(prev ?? []), attachment]);
                toast.success(`Archivo "${name}" cargado correctamente.`, { position: "top-right" });
                return attachment;
            } catch (error) {
                console.warn(error);
                showApiErrorToast(error, `Ocurrio un error al tratar de cargar el archivo "${name}".`);
            } finally {
                setUploadingAttachments((prev) => prev.filter((u) => u.id !== id));
                if (previewUrl)
                    URL.revokeObjectURL(previewUrl);
            }
        });
    }, [acceptedExtensions, disabled, hasDuplicateName, onChange]);

    /**
     * Handle on delete attachment from server.
     */
    const handleOnDeleteAttachment = useCallback(async (attachment: AttachmentResponse) => {
        if (disabled)
            return;
        setDeletingIds((prev) => [...prev, attachment.id]);
        try {
            await deleteAttachmentByIdMutation.mutateAsync({ announcementId: announcementId, attachmentId: attachment.id });
            onChange((prev) => prev.filter((a) => a.id !== attachment.id));
            toast.success(`Archivo "${attachment.name}" eliminado correctamente.`, { position: "top-right" });
        } catch (err) {
            showApiErrorToast(err, "No fue posible eliminar el archivo seleccionado.");
        } finally {
            setDeletingIds((prev) => prev.filter((id) => id !== attachment.id));
        }
    }, [disabled, onChange]);

    const totalCount = attachments.length + uploadingAttachments.length;

    return (
        <div className="space-y-5">
            <DragAndDrop
                acceptedExtensions={[...acceptedExtensions]}
                onFilesSelected={handleOnFilesSelected}
                disabled={disabled}
                label="Arrastra archivos aquí o haz clic para seleccionar"
                hint={`Hasta 10MB por archivo • ${acceptedExtensions.join(", ")}`}
            />

            {totalCount > 0 && (
                <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Attachment that already exists related to announcement record */}
                        {
                            attachments.map((attachment) => (
                                <AttachmentCard
                                    key={attachment.id}
                                    attachment={attachment}
                                    isDeleting={deletingIds.includes(attachment.id)}
                                    onDelete={async(attachment) => !disabled && await handleOnDeleteAttachment(attachment)}
                                />
                            ))
                        }

                        {/* Attachment cards when is uploading a file */}
                        {
                            uploadingAttachments.map((u) => (
                                <AttachmentCard
                                    key={u.id}
                                    attachment={{
                                        id: u.id,
                                        url: "",
                                        name: u.name,
                                        extension: u.extension,
                                        relatedRecordId: announcementId,
                                    }}
                                    isUploading={true}
                                    previewUrl={u.previewUrl}
                                    onDelete={() => { }}
                                />
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
