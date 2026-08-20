import { useEffect } from "react";
import { X } from "lucide-react";

import { useGetAnnouncementById } from "@/modules/announcements/hooks/announcements/useGetAnnouncementById";

interface Props {
    announcementId: string;
    onClose: () => void;
}

export const AnnouncementViewerOverlay = ({ announcementId, onClose }: Props) => {
    const { data, isLoading, isError } = useGetAnnouncementById({ id: announcementId })

    // Esc closes; also lock body scroll while overlay is open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    return (
        <>
            <section className="fixed inset-0 z-50 flex justify-end">

                <section className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-start justify-center overflow-y-auto animate-fade-in" data-testid="announcement-viewer-overlay">
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        data-testid="announcement-viewer-close"
                        className="cursor-pointer fixed top-6 right-6 z-110 w-11 h-11 rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors flex items-center justify-center"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-full max-w-4xl px-6 sm:px-10 py-14 sm:py-20">
                        {isLoading && (
                            <div className="text-center text-sm text-muted-foreground" data-testid="announcement-viewer-loading">
                                Cargando…
                            </div>
                        )}
                        {isError && (
                            <div className="text-center text-sm text-destructive" data-testid="announcement-viewer-error">
                                No fue posible cargar la información de la campaña seleccionada
                            </div>
                        )}
                        {data && (
                            <article
                                data-testid="announcement-viewer-content"
                                className="tiptap-content prose prose-neutral dark:prose-invert max-w-none ProseMirror"
                                /* Only the TipTap HTML content — no title, no metadata, per requirement */
                                dangerouslySetInnerHTML={{ __html: data.content || "" }}
                            />
                        )}
                    </div>
                </section>
            </section>
        </>
    );
}
