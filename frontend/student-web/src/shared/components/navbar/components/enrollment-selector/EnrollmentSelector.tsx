import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, GraduationCap } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import { ACADEMIC_CYCLE_ENROLLMENT_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { availableEnrollments, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";

/**
 * Global enrollment (inscription) selector. Changing the selection updates the
 * global ActiveEnrollmentStore, which re-queries the enrollment-dependent modules.
 * The academic cycle is always derived from the selected enrollment.
 */
export const EnrollmentSelector = () => {
    const enrollmentId = useActiveEnrollmentStore((s) => s.enrollmentId);
    const setEnrollmentId = useActiveEnrollmentStore((s) => s.setEnrollmentId);

    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const selected = availableEnrollments.find((e) => e.id === enrollmentId);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        const onClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("mousedown", onClickOutside);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("mousedown", onClickOutside);
        };
    }, []);

    if (!availableEnrollments.length) return null;

    return (
        <div ref={panelRef} className="relative">
            <button
                data-testid="enrollment-selector-trigger"
                onClick={() => setOpen((prev) => !prev)}
                className="cursor-pointer flex items-center gap-1.5 sm:gap-2 h-10 px-2.5 sm:px-3 rounded-md border border-border bg-background hover:bg-muted transition-colors">
                <GraduationCap className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="hidden sm:inline text-sm font-medium text-foreground max-w-40 truncate">
                    {selected?.academicCycle?.code ? `Ciclo escolar ${selected?.academicCycle?.code}` : "Seleccionar inscripción"}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
            </button>

            {open && (
                <section
                    data-testid="enrollment-selector-dropdown"
                    className="fixed inset-x-4 top-22 z-50 bg-card border border-border rounded-2xl shadow-lg py-2 animate-fade-in max-h-[calc(100dvh-7rem)] overflow-y-auto sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-80"
                >
                    <p className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">Inscripción por ciclo escolar</p>
                    {availableEnrollments.map((enrollment) => (
                        <button
                            key={enrollment.id}
                            onClick={() => {
                                setEnrollmentId(enrollment.id);
                                setOpen(false);
                            }}
                            className={cn(
                                "cursor-pointer w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors",
                                enrollment.id === enrollmentId
                                    ? "bg-muted text-foreground font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <span className="flex flex-col items-start">
                                <span>{enrollment.academicCycle?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {enrollment.academicCycleSchoolGroup?.name} · {labelOf(ACADEMIC_CYCLE_ENROLLMENT_STATUSES, enrollment.status)}
                                </span>
                            </span>
                            {enrollment.id === enrollmentId && <Check className="w-4 h-4 text-primary" />}
                        </button>
                    ))}
                </section>
            )}
        </div>
    );
}
