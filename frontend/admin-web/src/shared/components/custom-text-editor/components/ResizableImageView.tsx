import React, { useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Lock, Unlock } from "lucide-react";

type Corner = "nw" | "ne" | "sw" | "se";

const CORNER_CLASS: Record<Corner, string> = {
    nw: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
    ne: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
    sw: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
    se: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
};

/**
 * Notion/Docs-style resizable image NodeView for TipTap.
 *  - 4 corner handles (visible on hover/selection)
 *  - Aspect-ratio lock (toggle button + Shift inverts temporarily)
 *  - Min 40px / max 100% of container
 *  - Width & height persisted as <img width="N" height="N"> in HTML
 */
export const ResizableImageView = ({ node, updateAttributes, selected, editor }: NodeViewProps) => {
    const src = node.attrs.src as string;
    const alt = (node.attrs.alt as string | null) || "";
    const widthAttr = node.attrs.width as number | string | null;
    const heightAttr = node.attrs.height as number | string | null;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [aspectLocked, setAspectLocked] = useState(true);
    const [resizing, setResizing] = useState(false);

    const isEditable = editor.isEditable;

    const startResize = (ev: React.MouseEvent, corner: Corner) => {
        ev.preventDefault();
        ev.stopPropagation();
        const img = imgRef.current;
        if (!img) return;

        const startX = ev.clientX;
        const startY = ev.clientY;
        const startW = img.offsetWidth;
        const startH = img.offsetHeight;
        const ratio = startH === 0 ? 1 : startW / startH;
        const maxW = wrapperRef.current?.parentElement?.clientWidth || 9999;

        setResizing(true);

        const onMove = (mv: MouseEvent) => {
            // Sign-correct deltas so dragging outward always grows the image
            const rawDX = mv.clientX - startX;
            const rawDY = mv.clientY - startY;
            const dx = corner.includes("w") ? -rawDX : rawDX;
            const dy = corner.includes("n") ? -rawDY : rawDY;

            const effectiveLock = mv.shiftKey ? !aspectLocked : aspectLocked;

            // No permitir resize si está bloqueado
            if (aspectLocked && !mv.shiftKey) {
                updateAttributes({
                    width: startW,
                    height: startH,
                });
                return;
            }

            let newW = Math.round(startW + dx);
            let newH = Math.round(startH + dy);

            // Shift key inverts the current lock state (temporary toggle, like Figma)
            if (effectiveLock) {
                // Follow the dominant axis to keep movement smooth
                if (Math.abs(dx) >= Math.abs(dy)) newH = Math.round(newW / ratio);
                else newW = Math.round(newH * ratio);
            }

            // Clamp
            newW = Math.max(40, Math.min(maxW, newW));
            newH = Math.max(40, newH);

            updateAttributes({ width: newW, height: newH });
        };

        const onUp = () => {
            setResizing(false);
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    const showHandles = isEditable && (selected || resizing);

    return (
        <NodeViewWrapper
            className="inline-block align-top my-2"
            data-testid="resizable-image"
            data-drag-handle
        >
            <div
                ref={wrapperRef}
                className={`relative inline-block group ${selected || resizing ? "ring-2 ring-primary rounded-xl" : ""}`}
            >
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    width={widthAttr || undefined}
                    height={heightAttr || undefined}
                    draggable={false}
                    className="rounded-xl max-w-full block select-none"
                />

                {isEditable && (
                    <button
                        type="button"
                        contentEditable={false}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setAspectLocked((v) => !v); }}
                        title={aspectLocked ? "Aspect ratio bloqueado · click para liberar (Shift mientras arrastras para invertir)" : "Aspect ratio libre · click para bloquear"}
                        data-testid="resizable-image-lock"
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-card/95 border border-border shadow flex items-center justify-center transition-opacity ${showHandles ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                        {aspectLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                )}

                {isEditable && (["nw", "ne", "sw", "se"] as Corner[]).map((c) => (
                    <span
                        key={c}
                        contentEditable={false}
                        onMouseDown={(e) => startResize(e, c)}
                        data-testid={`resizable-image-handle-${c}`}
                        aria-label={`Redimensionar desde esquina ${c}`}
                        className={`absolute w-3.5 h-3.5 bg-primary border-2 border-white rounded-[3px] shadow transition-opacity ${CORNER_CLASS[c]} ${showHandles ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    />
                ))}

                {resizing && imgRef.current && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-mono pointer-events-none">
                        {imgRef.current.offsetWidth} × {imgRef.current.offsetHeight}
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
}
