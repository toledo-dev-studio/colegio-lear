import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Image as ImageIcon, Type, Quote, Heading1, Heading2, Undo2, Redo2,
  Link2,
} from "lucide-react";

import { LinkModal } from "./components/LinkModal";
import { FontSize } from "./extensions/FontSizeExtension";
import { ResizableImage } from "./extensions/ResizableImageExtension";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  testid?: string;
}

const DEFAULT_FONT_SIZE = "16px";
const FONT_SIZES = ["14px", "16px", "18px", "24px", "32px"];

export const TipTapEditor = ({ value, onChange, placeholder = "Escribe el contenido...", testid = "tiptap-editor" }: TipTapEditorProps) => {

  const [linkModal, setLinkModal] = useState<{ open: boolean, type: "link" | "image-url" }>();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: true,
          HTMLAttributes: {
            class: "text-primary underline",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      }),
      ResizableImage.configure({ HTMLAttributes: { class: "rounded-xl max-w-full" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      FontSize,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[260px] px-5 py-4",
        "data-testid": `${testid}-content`,
      },
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isHeading1: editor.isActive("heading", { level: 1 }),
      isHeading2: editor.isActive("heading", { level: 2 }),
      isBlockquote: editor.isActive("blockquote"),
      isActiveLink: editor.isActive("link"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isEmpty: editor.isEmpty,
      hasContentNodes: editor.state.doc.childCount > 1,
      hasSelection: !editor.state.selection.empty,
    }),
  });

  // Sync external value changes (e.g. when initialData loads after editor mount)
  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-input bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary" data-testid={testid}>
      <Toolbar editor={editor}>
        <Group>
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} testid="tt-undo" label="Deshacer"><Undo2 className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} testid="tt-redo" label="Rehacer"><Redo2 className="w-4 h-4" /></ToolBtn>
        </Group>
        <Group>
          <ToolBtn active={editorState.isBold} onClick={() => editor.chain().focus().toggleBold().run()} testid="tt-bold" label="Negrita"><Bold className="w-4 h-4" /></ToolBtn>
          <ToolBtn active={editorState.isItalic} onClick={() => editor.chain().focus().toggleItalic().run()} testid="tt-italic" label="Itálica"><Italic className="w-4 h-4" /></ToolBtn>
          <ToolBtn active={editorState.isUnderline} onClick={() => editor.chain().focus().toggleUnderline().run()} testid="tt-underline" label="Subrayado"><UnderlineIcon className="w-4 h-4" /></ToolBtn>
        </Group>
        <Group>
          <ToolBtn active={editorState.isHeading1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} testid="tt-h1" label="Título 1">
            <Heading1 className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn active={editorState.isHeading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} testid="tt-h2" label="Título 2"><Heading2 className="w-4 h-4" /></ToolBtn>
          <ToolBtn active={editorState.isBlockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} testid="tt-quote" label="Cita"><Quote className="w-4 h-4" /></ToolBtn>
        </Group>
        <Group>
          <ToolBtn active={editorState.isBulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} testid="tt-bullet" label="Viñetas"><List className="w-4 h-4" /></ToolBtn>
          <ToolBtn active={editorState.isOrderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} testid="tt-ordered" label="Lista numerada"><ListOrdered className="w-4 h-4" /></ToolBtn>
        </Group>
        <Group>
          <FontSizePicker editor={editor} />
        </Group>
        <Group>
          <ToolBtn onClick={() => setLinkModal({ open: true, type: "link" })} active={editorState.isActiveLink} testid="tt-link" label="Insertar enlace">
            <Link2 className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={() => setLinkModal({ open: true, type: "image-url" })} testid="tt-img-url" label="Insertar imagen por URL"><ImageIcon className="w-4 h-4" /></ToolBtn>
        </Group>
      </Toolbar>
      <div className="border-t border-border bg-card">
        <EditorContent editor={editor} />
        {
          (editorState.isEmpty && !editorState.hasContentNodes) && (
            <p className="pointer-events-none px-5 -mt-58.75 mb-50 text-sm text-muted-foreground select-none">{placeholder}</p>
          )
        }
      </div>
      {
        linkModal !== undefined && linkModal.open && (
          <>
            {/* Modal to add link to content for a text*/}
            <LinkModal
              open={linkModal.type === "link"}
              title="Enlace de acceso para la campaña:"
              description="Agrea un enlace de acceso para la campaña"
              inputLabel="Enlace de acceso:"
              inputPlaceholder="https://..."
              inputDefaultValue=""
              isLoading={false}
              handleClickCancel={() => {
                editor.chain().focus().deleteSelection();
                setLinkModal(undefined);
              }}
              handleClickConfirm={(link: string) => {
                editor.chain().focus().setLink({ href: link, target: "_blank" }).run();
                editor.chain().focus().deleteSelection();
                setLinkModal(undefined);
              }} />

            {/* Modal to add link to content for an image */}
            <LinkModal
              open={linkModal.type === "image-url"}
              title="Nueva imagen para la campaña:"
              description="Agrea una nueva imagen para la campaña por medio de un enlace"
              inputLabel="Enlace de la imagen:"
              inputPlaceholder="https://..."
              inputDefaultValue=""
              isLoading={false}
              handleClickCancel={() => setLinkModal(undefined)}
              handleClickConfirm={(link: string) => {
                editor.chain().focus().setImage({ src: link, alt: "Imagen" }).run();
                editor.chain().focus().deleteSelection();
                setLinkModal(undefined);
              }} />
          </>
        )
      }

    </div>
  );
}

function Toolbar({ children }: { editor: Editor; children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-muted/40 border-b border-border">{children}</div>;
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-border last:border-r-0 last:pr-0 last:mr-0">{children}</div>;
}

function ToolBtn({ children, onClick, active, disabled, testid, label }: { children: React.ReactNode; onClick: () => void; active?: boolean; disabled?: boolean; testid: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testid}
      aria-label={label}
      title={label}
      className={`cursor-pointer h-8 w-8 inline-flex items-center justify-center rounded-lg text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card"} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function FontSizePicker({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      fontSize:
        (editor.getAttributes("fontSize").size as string | undefined) || DEFAULT_FONT_SIZE,
    }),
  });

  return (
    <div className="relative">
      <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <Select
        value={editorState.fontSize}
        onValueChange={(value) => {
          if (!value)
            editor.chain().focus().unsetFontSize().run();
          else
            editor.chain().focus().setMark("fontSize", { size: value }).run();
        }}>
        <SelectTrigger size="sm" className="w-full pl-11 pr-8 py-4 rounded-full shadow-none my-0">
          <SelectValue placeholder="Selecciona un puesto de trabajo">
            {editorState.fontSize}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tamaños de letra</SelectLabel>
            {
              FONT_SIZES.map((s) => (
                <SelectItem key={s} value={s} label={s}>{s}</SelectItem>
              ))
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
