import { useCallback } from "react";
import { toast } from "sonner";

import { downloadFileFromUrl, getAttachmentFileIcon } from "@/lib/extensions/attachments";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

interface Props {
    /** Attachment information */
    attachment: AttachmentResponse;
}

export const AttachmentChip = ({ attachment }: Props) => {
    const { Icon, color, bg } = getAttachmentFileIcon(attachment.extension);

    const handleDownload = useCallback(async () => {
        if (!attachment.url)
            return;
        try {
            await downloadFileFromUrl(attachment.url, attachment.name);
        } catch (error) {
            console.warn(error);
            toast.error("No fue posible descargar el archivo seleccionado.", { position: "top-right" });
        }
    }, [attachment.url, attachment.name]);

    return (
        <span
            onDoubleClick={handleDownload}
            title={`Doble clic para descargar • ${attachment.name}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1 select-none cursor-pointer hover:border-primary/40 transition-colors">
            <span className={`w-5 h-5 rounded-md ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3 h-3 ${color}`} />
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-36">
                {attachment.name}
            </span>
        </span>
    );
}

export default AttachmentChip;