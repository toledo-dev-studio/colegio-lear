import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { generateTemporalId } from "@/lib/utils";
import { AttachmentCard } from "./AttachmentCard";
import { extractFileExtension } from "@/lib/files";
import type { Attachment } from "@/interfaces/entites/attachment";
import { CustomDragAndDrop } from "@/shared/components/CustomDragAndDrop";
import { useAttachmentsForAnnouncement } from "@/modules/announcements/hooks/useAttachmentsForAnnouncement";
import { DEFAULT_ACCEPTED_FILE_EXTENSIONS, DEFAULT_IMAGE_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "@/lib/attachment.constants";
import { promisePool } from "@/lib/promises";

/**
 * Attachments — owner of all attachment business logic for announcement.
 *
 * Responsibilities:
 *  - Wraps the decoupled <CustomDragAndDrop /> (visual only)
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
    attachments: Attachment[];
    acceptedExtensions?: readonly string[];
    /** Disable all interaction */
    disabled?: boolean;

    /** Handle actions */
    onChange: (
        next:
            | Attachment[]
            | ((prev: Attachment[]) => Attachment[])
    ) => void;
}

export const AttachmentsGrid = ({ announcementId, attachments, disabled, acceptedExtensions = DEFAULT_ACCEPTED_FILE_EXTENSIONS, onChange }: Props) => {

    const [uploadingAttachments, setUploadingAttachments] = useState<UploadAttachment[]>([]);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const { attachmentsMutation } = useAttachmentsForAnnouncement();

    // Use refs so async callbacks always read the freshest value/uploading
    const valueRef = useRef(attachments);

    useEffect(() => {
        valueRef.current = attachments;
    }, [attachments]);

    // Revoke object URLs on unmount to avoid leaks
    useEffect(() => uploadingAttachments.forEach((u) => u.previewUrl && URL.revokeObjectURL(u.previewUrl)), []);

    /**
     * Event to detect if any file is duplicated by name.
     */
    const isDuplicate = useCallback((file: File): boolean => {
        const current = valueRef.current;
        return current.some(
            (a) => a.name.toLowerCase() === file.name.toLowerCase(),
        );
    }, [],);

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
                toast.error(`El archivo "${file.name}" no cuenta con un formato válido.`);
                return;
            }

            // File size is bigger than available size?
            if (file.size > MAX_FILE_SIZE_BYTES) {
                toast.error(`El archivo "${file.name}" supera el límite de 10MB.`);
                return;
            }

            // A file with same name already exists?
            if (isDuplicate(file)) {
                toast.error(`Ya se encuentra cargado un archivo con el nombre "${file.name}".`);
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
                const attachment = await attachmentsMutation.upload.mutateAsync({ announcementId, file });
                onChange((prev) => [...(prev ?? []), attachment]);
                toast.success(`Archivo "${name}" cargado correctamente.`);
                return attachment;
            } catch (error) {
                console.warn(error);
                toast.error(`Ocurrio un error al tratar de cargar el archivo "${name}".`);
            } finally {
                setUploadingAttachments((prev) => prev.filter((u) => u.id !== id));
                if (previewUrl)
                    URL.revokeObjectURL(previewUrl);
            }
        });
    }, [acceptedExtensions, disabled, isDuplicate, onChange]);

    /**
     * Handle on delete attachment from server.
     */
    const handleOnDeleteAttachment = useCallback(async (attachment: Attachment) => {
        if (disabled)
            return;
        setDeletingIds((prev) => [...prev, attachment.id]);
        try {
            await attachmentsMutation.remove.mutateAsync({ announcementId: announcementId, attachmentId: attachment.id });
            onChange((prev) => prev.filter((a) => a.id !== attachment.id));
            toast.success(`Archivo "${attachment.name}" eliminado correctamente.`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No fue posible eliminar el archivo seleccionado.");
        } finally {
            setDeletingIds((prev) => prev.filter((id) => id !== attachment.id));
        }
    }, [disabled, onChange]);

    const totalCount = attachments.length + uploadingAttachments.length;

    return (
        <div className="space-y-5">
            <CustomDragAndDrop
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
                                    onDelete={handleOnDeleteAttachment}
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
