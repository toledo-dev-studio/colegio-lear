import { BookMarked, Calendar, GraduationCap, Layers } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store/auth.store";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import { OverviewCard } from "@/shared/components/overview-card/OverviewCard";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import { ACADEMIC_CYCLE_ENROLLMENT_STATUSES, ACADEMIC_CYCLE_PERIOD_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";

interface Props {
    academicCycle: AcademicCycleResponse;
    academicCycleEnrollment: AcademicCycleEnrollmentResponse;
}

export const AcademicCycleOverview = ({ academicCycle, academicCycleEnrollment }: Props) => {
    const { user: student } = useAuthStore();
    const { academicCycleSchoolGroup, scholarship, status } = academicCycleEnrollment;

    return (
        <>
            <section className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 w-full hover:bg-muted/40 transition-colors">
                <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mx-auto">
                    <OverviewCard
                        icon={Calendar}
                        label="Ciclo escolar"
                        value={academicCycle?.code}
                        hint={`Periodo: ${labelOf(ACADEMIC_CYCLE_PERIOD_TYPES, academicCycle?.periodType)}`}
                    />
                    <OverviewCard
                        icon={Layers}
                        label="Grupo asignado"
                        value={academicCycleSchoolGroup?.name || "—"}
                        hint={academicCycleSchoolGroup?.description || "Sin descripción"}
                    />
                    <OverviewCard
                        icon={BookMarked}
                        label="Estatus de inscripción"
                        value={labelOf(ACADEMIC_CYCLE_ENROLLMENT_STATUSES, status)}
                        hint={`Matricula: ${student!.enrollment}`}
                    />
                    <OverviewCard
                        icon={GraduationCap}
                        label="Beca aplicada"
                        value={scholarship?.name || "Sin beca"}
                        hint={scholarship ? `${scholarship.discountPercentage}% de descuento` : "—"}
                    />
                </section>
                <section className="flex flex-col gap-y-2 mt-4 sm:mt-6">
                    <p className="text-[11px] text-muted-foreground flex items-center -mb-2">Duración del ciclo escolar: {formatFriendlyDate(academicCycle.startDate)} - {formatFriendlyDate(academicCycle.endDate)}</p>
                </section>
            </section>
        </>
    )
}
