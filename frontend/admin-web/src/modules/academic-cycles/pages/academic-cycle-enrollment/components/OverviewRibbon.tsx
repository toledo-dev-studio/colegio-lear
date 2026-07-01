import { Calendar, CheckCircle2, GraduationCap, Layers } from "lucide-react";

import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import { OverviewCard } from "@/shared/components/overview-card/OverviewCard";
import { ACADEMIC_CYCLE_PERIOD_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Props {
    academicCycle: AcademicCycleResponse;
    academicCycleEnrollment: AcademicCycleEnrollmentResponse;
}

export const OverviewRibbon = ({ academicCycle, academicCycleEnrollment }: Props) => {
    const { academicCycleSchoolGroup, scholarship } = academicCycleEnrollment;

    return (
        <>
            <section className="bg-card rounded-3xl border border-border shadow-sm p-4 sm:p-6 w-full">
                <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mx-auto">
                    <OverviewCard
                        icon={Calendar}
                        label="Ciclo escolar"
                        value={academicCycle?.code}
                        hint={`Periodo: ${labelOf(ACADEMIC_CYCLE_PERIOD_TYPES, academicCycle?.periodType)}`}
                    />
                    <OverviewCard
                        icon={Layers}
                        label="Grupo"
                        value={academicCycleSchoolGroup?.name || "—"}
                        hint={academicCycleSchoolGroup?.description || "Sin descripción"}
                    />
                    <OverviewCard
                        icon={GraduationCap}
                        label="Beca aplicada"
                        value={scholarship?.name || "Sin beca"}
                        hint={scholarship ? `${scholarship.discountPercentage}% de descuento` : "—"}
                    />
                    <OverviewCard
                        icon={CheckCircle2}
                        label="Fecha de inscripción"
                        value={formatFriendlyDate(academicCycleEnrollment.createdAt!)}
                        hint={`Vigencia: ${formatFriendlyDate(academicCycle.endDate)}`}
                    />
                </section>
            </section>
        </>
    )
}
