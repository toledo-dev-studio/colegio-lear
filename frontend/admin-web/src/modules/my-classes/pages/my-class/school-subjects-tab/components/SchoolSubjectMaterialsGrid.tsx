import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { promisePool } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { extractFileExtension } from "@/lib/extensions/attachments";
import { DragAndDrop } from "@/shared/components/drag-and-drop/DragAndDrop";
import { AttachmentCard } from "@/shared/components/attachment-card/AttachmentCard";
import { DEFAULT_ACCEPTED_FILE_EXTENSIONS, DEFAULT_IMAGE_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "@/lib/constants/attachment.constants";
import { useUploadSchoolSubjectMaterial } from "../../../../hooks/useUploadSchoolSubjectMaterial";
import { useDeleteSchoolSubjectMaterialById } from "../../../../hooks/useDeleteSchoolSubjectMaterialById";
import type { SchoolSubjectMaterialResponse } from "@/interfaces/responses/school-subject-material.response";

/**
 * School subject materials — owner of all attachment business logic for the materials panel.
 *
 * Responsibilities:
 *  - Wraps the decoupled <DragAndDrop /> (visual only)
 *  - Validates files (extension whitelist, max size 10MB, duplicates)
 *  - Triggers the (simulated) upload service immediately per selected file
 *  - Holds per-file uploading/deleting UI state
 *  - Renders the responsive grid of materials
 *  - Handles delete with simulated async + optimistic UI
 *  - Drives parent state via value/onChange (controlled)
 */
interface UploadMaterial {
    id: string;
    name: string;
    extension: string;
    previewUrl?: string;
    file: File;
}

interface Props {
    materials: SchoolSubjectMaterialResponse[];
    isLoading: boolean;
    isError: boolean;
    loggedInUserCanWrite: boolean;
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    /** Handle actions */
    onChange: (
        next:
            | SchoolSubjectMaterialResponse[]
            | ((prev: SchoolSubjectMaterialResponse[]) => SchoolSubjectMaterialResponse[])
    ) => void;
}

export const SchoolSubjectMaterialsGrid = ({ materials = [], isLoading, isError, loggedInUserCanWrite, academicCycleSchoolGroupId, schoolSubjectId, onChange }: Props) => {
    // Component hooks & stores
    const [uploadingMaterials, setUploadingMaterials] = useState<UploadMaterial[]>([]);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const deleteMaterialMutation = useDeleteSchoolSubjectMaterialById();
    const uploadMaterialMutation = useUploadSchoolSubjectMaterial();
    const disabled = !loggedInUserCanWrite || uploadMaterialMutation.isPending || deleteMaterialMutation.isPending;

    // Revoke object URLs on unmount to avoid leaks
    useEffect(() => {
        return () => {
            uploadingMaterials.forEach((u) => u.previewUrl && URL.revokeObjectURL(u.previewUrl))
        }
    }, []);

    /**
     * Event to detect if any file is duplicated by name.
     */
    const hasDuplicateName = useCallback((file: File): boolean => {
        return materials.some(
            (m) => m.name.toLowerCase() === file.name.toLowerCase()
        );
    }, [materials]);

    /**
     * Event handler executed when files where selected.
     * Validate an upload files to server generating a public url.
     */
    const handleOnFilesSelected = useCallback(async (files: File[]) => {
        if (disabled)
            return;

        const materialsToUpload: UploadMaterial[] = [];

        for (const file of files) {
            const fileExtension = extractFileExtension(file.name);

            // File has an invalid extension?
            if (!(DEFAULT_ACCEPTED_FILE_EXTENSIONS.map((e) => e.toLowerCase()).includes(`.${fileExtension}`.toLowerCase()))) {
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

            materialsToUpload.push({
                id: generateTemporalId(),
                name: file.name,
                extension: fileExtension,
                previewUrl: isImage ? URL.createObjectURL(file) : undefined,
                file: file
            });
        }

        if (materialsToUpload.length == 0)
            return;

        // Show all uploading skeletons immediately
        setUploadingMaterials((prev) => [...prev, ...materialsToUpload]);

        // Process uploads in parallel in pool of 3 requests; each finishes independently
        await promisePool(materialsToUpload, 3, async ({ id, name, previewUrl, file }) => {
            try {
                const material = await uploadMaterialMutation.mutateAsync({ academicCycleSchoolGroupId, schoolSubjectId, file });
                onChange((prev) => [...(prev ?? []), material]);
                toast.success(`Archivo "${name}" cargado correctamente.`, { position: "top-right" });
                return material;
            } catch (error) {
                console.warn(error);
                toast.error(`Ocurrio un error al tratar de cargar el archivo "${name}".`, { position: "top-right" });
            } finally {
                setUploadingMaterials((prev) => prev.filter((u) => u.id !== id));
                if (previewUrl)
                    URL.revokeObjectURL(previewUrl);
            }
        });
    }, [disabled, hasDuplicateName, onChange, academicCycleSchoolGroupId, schoolSubjectId]);

    /**
     * Handle on delete material from server.
     */
    const handleOnDeleteMaterial = useCallback(async (material: SchoolSubjectMaterialResponse) => {
        if (disabled)
            return;
        setDeletingIds((prev) => [...prev, material.id]);
        try {
            await deleteMaterialMutation.mutateAsync({
                id: material.id,
                academicCycleSchoolGroupId,
                schoolSubjectId,
            });
            onChange((prev) => prev.filter((m) => m.id !== material.id));
            toast.success(`Archivo "${material.name}" eliminado correctamente.`, { position: "top-right" });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No fue posible eliminar el archivo seleccionado.", { position: "top-right" });
        } finally {
            setDeletingIds((prev) => prev.filter((id) => id !== material.id));
        }
    }, [disabled, onChange, academicCycleSchoolGroupId, schoolSubjectId]);

    const totalCount = materials.length + uploadingMaterials.length;

    return (
        <div className="space-y-5">
            {
                loggedInUserCanWrite && (
                    <DragAndDrop
                        acceptedExtensions={[...DEFAULT_ACCEPTED_FILE_EXTENSIONS]}
                        onFilesSelected={handleOnFilesSelected}
                        disabled={disabled}
                        label="Arrastra archivos aquí o haz clic para seleccionar"
                        hint={`Hasta 10MB por archivo • ${DEFAULT_ACCEPTED_FILE_EXTENSIONS.join(", ")}`}
                    />
                )
            }

            {/* Loading */}
            {
                isLoading && (
                    <div className="grid grid-cols-2 gap-4">
                        {
                            Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-36 w-full rounded-2xl" />
                            ))
                        }
                    </div>
                )
            }

            {/* No content */}
            {
                (!totalCount && !isLoading && !isError) && (
                    <p className="text-sm text-muted-foreground">
                        No se encontraron materiales de apoyo cargados para esta materia.
                    </p>
                )
            }

            {/* Error */}
            {
                isError && (
                    <p className="text-sm text-destructive">No fue posible obtener los materiales de apoyo de la materia.</p>
                )
            }

            {totalCount > 0 && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Material that already exists related to school subject record */}
                        {
                            materials.map((material) => (
                                <AttachmentCard
                                    key={material.id}
                                    attachment={material}
                                    isDeleting={deletingIds.includes(material.id)}
                                    readOnly={!loggedInUserCanWrite}
                                    onDelete={(material) => { if (!disabled) handleOnDeleteMaterial(material as SchoolSubjectMaterialResponse); }}
                                />
                            ))
                        }

                        {/* Material cards when is uploading a file */}
                        {
                            uploadingMaterials.map((u) => (
                                <AttachmentCard
                                    key={u.id}
                                    attachment={{
                                        id: u.id,
                                        url: "",
                                        name: u.name,
                                        extension: u.extension,
                                        relatedRecordId: schoolSubjectId,
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

export default SchoolSubjectMaterialsGrid;