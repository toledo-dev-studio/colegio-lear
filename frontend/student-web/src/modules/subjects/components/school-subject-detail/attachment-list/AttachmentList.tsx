// Lista reutilizable de archivos adjuntos descargables con ícono por extensión

import { Download, File, FileSpreadsheet, FileText, Presentation, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

const getAttachmentConfig = (extension: string): { icon: LucideIcon; className: string } => {
    switch (extension.toLowerCase()) {
        case "pdf":
            return { icon: FileText, className: "text-rose-600 bg-rose-500/10" };
        case "doc":
        case "docx":
            return { icon: FileText, className: "text-sky-600 bg-sky-500/10" };
        case "xls":
        case "xlsx":
        case "csv":
            return { icon: FileSpreadsheet, className: "text-emerald-600 bg-emerald-500/10" };
        case "ppt":
        case "pptx":
            return { icon: Presentation, className: "text-orange-600 bg-orange-500/10" };
        default:
            return { icon: File, className: "text-muted-foreground bg-muted" };
    }
};

interface Props {
    attachments: AttachmentResponse[];
}

export const AttachmentList = ({ attachments }: Props) => {
    if (attachments.length === 0) return null;

    return (
        <ul className="flex flex-wrap gap-1.5">
            {attachments.map((attachment) => {
                const { icon: Icon, className } = getAttachmentConfig(attachment.extension);

                return (
                    <li key={attachment.id}>
                        <a
                            href={attachment.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/70 px-2.5 py-1.5 rounded-md transition-colors max-w-full"
                            title={`Descargar ${attachment.name}.${attachment.extension}`}
                        >
                            <span className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", className)}>
                                <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="min-w-0 truncate max-w-52">
                                {attachment.name}.{attachment.extension}
                            </span>
                            <Download className="w-3 h-3 text-muted-foreground shrink-0" />
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
