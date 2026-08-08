import { Image } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageView } from "../components/ResizableImageView";

/**
 * Extension that adds interactive drag-to-resize handles to images inside
 * the TipTap editor. Persists `width` and `height` attributes on the <img>
 * HTML element so the size survives saving + reload.
 */
export const ResizableImage = Image.extend({
    name: "image",

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null as number | string | null,
                parseHTML: (el) => {
                    const w = (el as HTMLElement).getAttribute("width");
                    return w ? (isNaN(Number(w)) ? w : Number(w)) : null;
                },
                renderHTML: (attrs: { width?: number | string | null }) =>
                    attrs.width ? { width: String(attrs.width) } : {},
            },
            height: {
                default: null as number | string | null,
                parseHTML: (el) => {
                    const h = (el as HTMLElement).getAttribute("height");
                    return h ? (isNaN(Number(h)) ? h : Number(h)) : null;
                },
                renderHTML: (attrs: { height?: number | string | null }) =>
                    attrs.height ? { height: String(attrs.height) } : {},
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});
