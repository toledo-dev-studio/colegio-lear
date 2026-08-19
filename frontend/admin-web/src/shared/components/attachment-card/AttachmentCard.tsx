import { useCallback, useState } from "react";
import {
    Trash2,
    Copy,
    Loader2,
    Check,
} from "lucide-react";
import { toast } from "sonner";

import { DEFAULT_IMAGE_EXTENSIONS } from "@/lib/constants/attachment.constants";
import { downloadFileFromUrl, getAttachmentFileIcon } from "@/lib/extensions/attachments";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

interface Props {
    /** Attachment information */
    attachment: AttachmentResponse;
    /** True when the card represents a still-uploading file */
    isUploading?: boolean;
    /** True when this card is currently being deleted */
    isDeleting?: boolean;
    /** Optional client preview URL (object URL) for images while uploading */
    previewUrl?: string;
    /** True when the attachment actions (copy/delete) must be hidden (read-only mode) */
    readOnly?: boolean;

    /** Handle event when click on delete option */
    onDelete: (attachment: AttachmentResponse) => void;
}

const isImage = (ext: string) => DEFAULT_IMAGE_EXTENSIONS.includes(`.${ext}`.toLowerCase());

export const AttachmentCard = ({ attachment, isUploading, isDeleting, previewUrl, readOnly = false, onDelete }: Props) => {

    const [copied, setCopied] = useState(false);
    const { Icon, color, bg } = getAttachmentFileIcon(attachment.extension);

    const showImage = isImage(attachment.extension);
    const imgSrc = previewUrl || (showImage ? attachment.url : undefined);

    const handleCopyUrl = useCallback(async () => {
        try {
            setCopied(true);
            await navigator.clipboard.writeText(attachment.url);
            toast.success("URL del adjunto copiada al portapapeles", { position: "top-right" });
            window.setTimeout(() => setCopied(false), 1400);
        } catch {
            toast.error("No se pudo copiar la URL del adjunto", { position: "top-right" });
        }
    }, []);

    const handleDownload = useCallback(async () => {
        if (!attachment.url || isUploading || isDeleting)
            return;
        try {
            await downloadFileFromUrl(attachment.url, attachment.name);
        } catch (error) {
            console.warn(error);
            toast.error("No fue posible descargar el archivo seleccionado.", { position: "top-right" });
        }
    }, [attachment.url, attachment.name, isUploading, isDeleting]);

    return (
        <div
            onDoubleClick={handleDownload}
            className={[
                "group relative bg-card rounded-2xl border border-border overflow-hidden transition-all cursor-pointer select-none",
                "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
                isUploading || isDeleting ? "pointer-events-none" : "",
            ].join(" ")}
        >
            {/* Preview area */}
            <div className="relative aspect-4/3 w-full bg-muted/40 flex items-center justify-center overflow-hidden">
                {showImage && imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 ${color}`} />
                    </div>
                )}

                {/* Uploading overlay */}
                {isUploading && (
                    <div
                        className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-[11px] font-medium text-foreground/80">Subiendo...</span>
                    </div>
                )}

                {/* Deleting overlay */}
                {isDeleting && (
                    <div
                        className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-destructive" />
                        <span className="text-[11px] font-medium text-foreground/80">Eliminando...</span>
                    </div>
                )}

                {/* Extension chip */}
                {!showImage && attachment.extension && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-card/90 backdrop-blur text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border border-border">
                        {attachment.extension}
                    </span>
                )}

                {/* Hover actions */}
                {!isUploading && !isDeleting && !readOnly && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            onClick={handleCopyUrl}
                            title="Copiar URL"
                            aria-label="Copiar URL"
                            className="cursor-pointer w-8 h-8 rounded-full bg-card/95 backdrop-blur border border-border shadow flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(attachment);
                            }}
                            title="Eliminar archivo"
                            aria-label="Eliminar archivo"
                            className="cursor-pointer w-8 h-8 rounded-full bg-card/95 backdrop-blur border border-border shadow flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* File name */}
            <div className="px-3 py-2.5 border-t border-border">
                <p
                    className="text-xs font-medium text-foreground truncate"
                    title={attachment.name}>
                    {attachment.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate" title={attachment.url}>
                    {attachment.url}
                </p>
            </div>
        </div>
    );
}
