import { useState } from "react";

import * as DOMPurify from "isomorphic-dompurify";
import { AlertCircle, Code2, Eye } from "lucide-react";
import { Switch } from "@/shared/ui/switch";
import { TipTapEditor } from "./TipTapEditor";

/**
 * Tags that won't be validate to open / close 
 * Example: <p><p> = View error
 */
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/**
 * Sanitize HTML content to prevent scripts injections
 */
const SANITIZE_CONFIG: DOMPurify.Config = {
  FORBID_TAGS: ["script", "iframe", "object", "embed", "style", "form"],
  FORBID_ATTR: [
    "onerror", "onload", "onclick", "onmouseover", "onmouseenter",
    "onmouseleave", "onfocus", "onblur", "onchange", "onsubmit",
    "onkeydown", "onkeyup", "onkeypress",
  ],
};

/**
 * Validates HTML tag balance. Returns error string or null if valid.
 * Exposed so RHF validators can also run this check on submit.
 */
export function validateHtmlSyntax(html: string): string | null {
  if (!html || !html.trim()) return null;
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g;
  const stack: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) !== null) {
    const full = m[0];
    const tag = m[1].toLowerCase();
    const selfClose = m[2] === "/";
    const isClose = full.startsWith("</");
    if (isClose) {
      if (stack.length === 0 || stack[stack.length - 1] !== tag) {
        return `Etiqueta de cierre inesperada: </${tag}>`;
      }
      stack.pop();
    } else if (!selfClose && !VOID_TAGS.has(tag)) {
      stack.push(tag);
    }
  }
  if (stack.length > 0) {
    return `Etiqueta sin cerrar: <${stack[stack.length - 1]}>`;
  }
  // Detect stray unmatched angle brackets outside tags (very light)
  // Skipped to avoid false positives with math/text content.
  return null;
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as unknown as string;
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  testid?: string;
}

export const TextEditor = ({ value, onChange, placeholder, testid }: Props) => {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [draft, setDraft] = useState<string>(value || "");
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (checked: boolean) => {
    if (checked) {
      // Switching TO html: seed draft with the current sanitized value.
      setDraft(value || "");
      setError(validateHtmlSyntax(value || ""));
    }
    setMode(checked ? "html" : "visual");
  };

  const handleHtmlChange = (raw: string) => {
    setDraft(raw);
    const err = validateHtmlSyntax(raw);
    setError(err);
    if (!err) {
      // Only propagate sanitized clean HTML upstream when valid.
      onChange(sanitizeHtml(raw));
    } else {
      // Propagate raw so RHF validator also fails on submit.
      onChange(raw);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="w-3.5 h-3.5" />
          <span>Editor visual</span>
        </div>
        <Switch
          size="sm"
          checked={mode === "html"}
          onCheckedChange={handleModeChange}
          data-testid="an-form-content-mode-toggle"
          aria-label="Cambiar entre editor visual y código HTML"
        />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Code2 className="w-3.5 h-3.5" />
          <span>Código HTML</span>
        </div>
      </div>

      {mode === "visual" ? (
        <TipTapEditor value={value} onChange={onChange} placeholder={placeholder} testid={testid} />
      ) : (
        <div>
          <textarea
            data-testid="an-form-content-html-textarea"
            className="w-full min-h-75 font-mono text-xs leading-relaxed p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            value={draft}
            onChange={(e) => handleHtmlChange(e.target.value)}
            spellCheck={false}
            placeholder="<p>Escribe HTML aquí...</p>"
          />
          {error && (
            <div className="flex items-start gap-1.5 mt-1.5 text-xs text-destructive" data-testid="an-form-content-html-error">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Se removerán scripts, iframes y atributos peligrosos automáticamente. El guardado se
            bloqueará si el HTML tiene errores de sintaxis.
          </p>
        </div>
      )}
    </div>
  );
}
