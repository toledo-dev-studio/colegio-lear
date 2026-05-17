import React, { useCallback, useRef, useState } from "react";
import { UploadCloudIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Props {
    /** Whitelist of accepted file extensions, e.g. [".png", ".pdf"] */
    acceptedExtensions: string[];
    /** Called whenever the user selects (or drops) one or more files */
    onFilesSelected: (files: File[]) => void;
    /** Allow multi-file selection (default: true) */
    multiple?: boolean;
    /** Disable interaction (e.g. while parent is processing) */
    disabled?: boolean;
    /** Optional custom label for the call-to-action */
    label?: string;
    /** Optional helper text */
    hint?: string;
    /** Optional testId */
    testId?: string;
}

/**
 * Pure, decoupled drag & drop file picker.
 *
 * Responsibilities (single):
 *  - Visual drag & drop interaction
 *  - Trigger native file selector on click / Enter / Space
 *  - Emit a `File[]` array to its parent via `onFilesSelected`
 *
 * NOT its responsibility:
 *  - Uploading files
 *  - Validating business rules (size, duplicates, max count)
 *  - Rendering previews / grid
 *  - Owning attachment state
 *  - Talking to React Hook Form
 *
 * All of those concerns live in the parent component.
 */
export const CustomDragAndDrop = ({ acceptedExtensions, onFilesSelected, multiple = true, disabled = false, label = "Arrastra tus archivos aquí o haz clic para seleccionar", hint, testId = "file-dropzone" }: Props) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const accept = acceptedExtensions.join(",");
    const extensionsLabel =
        hint ?? `Formatos permitidos: ${acceptedExtensions.join(", ")}`;

    const openPicker = useCallback(() => {
        if (disabled) return;
        inputRef.current?.click();
    }, [disabled]);

    const emit = useCallback(
        (fileList: FileList | null) => {
            if (!fileList || fileList.length === 0) return;
            onFilesSelected(Array.from(fileList));
        },
        [onFilesSelected],
    );

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setIsDragActive(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (disabled) return;
        emit(e.dataTransfer.files);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
        }
    };

    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            data-testid={testId}
            data-drag-active={isDragActive}
            onClick={openPicker}
            onKeyDown={onKeyDown}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={
                cn(
                    "group relative w-full rounded-2xl border-2 border-dashed px-6 py-8 text-center select-none transition-all outline-none",
                    "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
                    disabled ? "opacity-50 cursor-not-allowed border-border bg-muted/30" : "cursor-pointer hover:border-primary/60 hover:bg-primary/5",
                    isDragActive ? "border-primary bg-primary/10 scale-[1.01] shadow-sm" : "border-border bg-muted/30"
                )}>

            <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className={
                    cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        isDragActive ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/40"
                    )}>
                    <UploadCloudIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{extensionsLabel}</p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                className="hidden"
                data-testid={`${testId}-input`}
                onChange={(e) => {
                    emit(e.target.files);
                    // Reset so the same file can be selected again later
                    e.target.value = "";
                }}
            />
        </div>
    );
}
