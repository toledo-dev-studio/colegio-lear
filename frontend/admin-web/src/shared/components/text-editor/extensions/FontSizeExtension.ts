import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * Minimal FontSize mark backed by an inline style on a <span>.
 * Allows toggling sizes like 12px, 14px, 16px, 18px, 24px, 32px.
 *
 * Usage: editor.chain().focus().setMark("fontSize", { size: "18px" }).run()
 *        editor.chain().focus().unsetMark("fontSize").run()
 */
export const FontSize = Mark.create({
    name: "fontSize",

    addOptions() {
        return { HTMLAttributes: {} };
    },

    addAttributes() {
        return {
            size: {
                default: null as string | null,
                parseHTML: (el: HTMLElement) => el.style.fontSize || null,
                renderHTML: (attrs: { size?: string | null }) =>
                    attrs.size ? { style: `font-size: ${attrs.size}` } : {},
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span",
                getAttrs: (el) => {
                    const size = (el as HTMLElement).style.fontSize;
                    return size ? { size } : false;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
});
