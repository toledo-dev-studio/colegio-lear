import { useEffect, useRef, useState } from "react";
import { ChevronDown, X, Check, Users } from "lucide-react";

import { cn } from "@/lib/extensions/utils";

interface Option { key: string, label: string };

interface Props {
    placeholder: string;
    availableOptions: Option[];
    value: Option[];
    onChange: (value: Option[]) => void;
}

export const CustomMultiSelect = (props: Props) => {

    const { placeholder = "Selecciona un registro...", availableOptions, value, onChange } = props;
    
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const toggle = (opt: Option) => {
        const exists = value.some((v) => v.key === opt.key);
        onChange(exists ? value.filter((v) => v.key !== opt.key) : [...value, opt]);
    };

    const remove = (key: string) => onChange(value.filter((v) => v.key !== key));

    return (
        <div className="relative" ref={ref} data-testid="multi-select">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                data-testid="multi-select-trigger"
                className={
                    cn(
                        "pill-input w-full pl-8 h-12 py-1 rounded-full text-left flex items-center justify-between",
                        "bg-transparent disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80"
                    )
                }
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2 text-sm truncate">
                    <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                    {value.length === 0
                        ? <span className="text-muted-foreground">{placeholder}</span>
                        : <span className="text-foreground">{value.length} registro(s) seleccionada(s)</span>}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <ul role="listbox" className="absolute z-20 mt-2 w-full bg-card border border-border rounded-2xl shadow-xl p-1.5 animate-fade-in" data-testid="multi-select-options">
                    {availableOptions.map((a) => {
                        const checked = value.some((v) => v.key === a.key);
                        return (
                            <li key={a.key}>
                                <button
                                    type="button"
                                    onClick={() => toggle(a)}
                                    role="option"
                                    aria-selected={checked}
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
                                >
                                    <span className="text-foreground">{a.label}</span>
                                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary" : "border-border bg-card"}`}>
                                        {checked && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3" data-testid="multi-select-chips">
                    {value.map((a) => (
                        <span key={a.key} className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                            {a.label}
                            <button type="button" onClick={() => remove(a.key)} data-testid={`multi-select-chip-remove-${a.key}`} className="hover:text-primary/70 cursor-pointer" aria-label={`Quitar ${a.label}`}>
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
