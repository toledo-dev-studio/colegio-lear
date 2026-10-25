// Material de apoyo de una tarea: lista de archivos adjuntos descargables

import { Paperclip } from "lucide-react";

import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";
import { AttachmentList } from "../attachment-list/AttachmentList";

interface Props {
    attachments: AttachmentResponse[];
}

export const TaskAttachments = ({ attachments }: Props) => {
    if (attachments.length === 0) return null;

    return (
        <section className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> Material de apoyo
            </p>
            <AttachmentList attachments={attachments} />
        </section>
    );
}
