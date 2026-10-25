// Sección de Material de apoyo de una materia: lista de archivos adjuntos
// descargables, con estados vacío y de carga

import { Info } from "lucide-react";

import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { SchoolSubjectMaterialResponse } from "@/interfaces/responses/school-subject-material.response";
import { AttachmentList } from "../attachment-list/AttachmentList";

interface Props {
    materials: SchoolSubjectMaterialResponse[];
    isLoading: boolean;
}

export const MaterialsSection = ({ materials, isLoading }: Props) => {
    const attachments = materials.map((material) => material.attachment);

    return (
        <section className="flex flex-col gap-y-4">
            {
                isLoading ? (
                    <section className="flex flex-col gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-9 w-64 rounded-md" />
                        ))}
                    </section>
                ) : attachments.length === 0 ? (
                    <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3">
                        <Info className="w-4 h-4 shrink-0" />
                        <p>Esta materia no tiene material de apoyo.</p>
                    </section>
                ) : (
                    <AttachmentList attachments={attachments} />
                )
            }
        </section>
    );
}
