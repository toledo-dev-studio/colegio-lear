import { CalendarDays } from "lucide-react";

import { formatFriendlyDate } from "@/lib/extensions/formatters";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

interface Props {
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    title: string;
    description?: string;
    studentName?: string;
    cycle?: AcademicCycleResponse | null;
}

export const ModulePageTitle = ({ icon: Icon, badge, title, description, studentName, cycle }: Props) => {
    return (
        <>
            <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                <section className="relative flex flex-col xl:flex-row xl:items-center gap-6">
                    <section className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] uppercase tracking-widest font-semibold">
                            <Icon className="w-3.5 h-3.5" />
                            {badge}
                        </span>
                        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl xl:text-4xl text-foreground tracking-tight mt-3">
                            {title && (
                                <span className="text-primary">{title} </span>
                            )}
                            {studentName}
                        </h1>
                        {
                            description && (
                                <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl">
                                    {description}
                                </p>
                            )
                        }
                    </section>

                    {
                        cycle && (
                            <section className="shrink-0 flex items-center gap-3 rounded-2xl border border-border bg-card/80 backdrop-blur-sm pl-4 px-8 py-3 shadow-sm">
                                <section className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <CalendarDays className="w-5 h-5" />
                                </section>
                                <section className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ciclo escolar</p>
                                    <p className="text-sm font-bold text-foreground leading-tight truncate">{cycle.code}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        {formatFriendlyDate(cycle.startDate)} – {formatFriendlyDate(cycle.endDate)}
                                    </p>
                                </section>
                            </section>
                        )
                    }
                </section>
            </section>
        </>
    )
}
