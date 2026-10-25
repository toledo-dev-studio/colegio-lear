import { useNavigate } from "react-router";
import { CalendarDays, GraduationCap, UserMinus } from "lucide-react";

import { TopGroupsTable } from "./TopGroupsTable";
import { KpiCard } from "@/shared/components/kpi-card/KpiCard";
import { SectionHeader } from "@/modules/dashboard/components/SectionHeader";
import { useGetAcademicCyclesSummary } from "@/modules/dashboard/hooks/useGetAcademicCyclesSummary";

export const AcademicCyclesSummary = () => {
    // Component hooks and stores
    const navigate = useNavigate();
    const { data, isFetching } = useGetAcademicCyclesSummary();

    return (
        <>
            <section data-testid="dash-academic-summary">
                <SectionHeader label="Resumen de alumnos & ciclos escolares" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                    <KpiCard
                        className="col-span-1 sm:col-span-2 lg:col-span-1"
                        label="Ciclos escolares activos"
                        icon={CalendarDays}
                        tone="primary"
                        hint="Ciclos con inscripciones y clases vigentes"
                        testid="dash-academic-active-cycles"
                        value={data?.activeAcademicCyclesCount ?? 0}
                        loading={isFetching}
                        onArrowUpClick={() => navigate("/academic-cycles")} />
                    <KpiCard
                        label="Alumnos inscritos"
                        icon={GraduationCap}
                        tone="emerald"
                        hint="En ciclos escolares activos"
                        testid="dash-academic-active-students"
                        value={data?.activeStudentsCount ?? 0}
                        loading={isFetching} 
                        onArrowUpClick={() => navigate("/academic-cycles")} />
                    <KpiCard
                        label="Alumnos dados de baja"
                        icon={UserMinus}
                        tone="rose"
                        hint="Baja durante ciclos activos"
                        testid="dash-academic-inactive-students"
                        value={data?.droppedStudentsCount ?? 0}
                        loading={isFetching}
                        onArrowUpClick={() => navigate("/academic-cycles")} />
                </div>
                <TopGroupsTable data={data?.topGroups} loading={isFetching} />
            </section>
        </>
    )
}
