import { useNavigate } from "react-router";
import { BookOpen, BriefcaseBusiness, Building2, Shield } from "lucide-react";

import { QuickAccess } from "./QuickAccess";
import { LatestTeachersTable } from "./LatestTeachersTable";
import { KpiCard } from "@/shared/components/kpi-card/KpiCard";
import { SectionHeader } from "@/modules/dashboard/components/SectionHeader";
import { useGetSystemSummary } from "@/modules/dashboard/hooks/useGetSystemSummary";
import { useGetLatestTeachersSummary } from "@/modules/dashboard/hooks/useGetLatestTeachersSummary";

export const SystemSummary = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const { data, isFetching } = useGetSystemSummary();
    const { data: teachers, isFetching: isFetchingTeachers } = useGetLatestTeachersSummary();

    return (
        <>
            <section data-testid="dash-employee-summary">
                <SectionHeader label="Resumen del sistema" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
                    <KpiCard
                        label="Personal administrativo registrado"
                        icon={Building2}
                        tone="sky"
                        hint="Cantidad de personal administrativo registrados"
                        testid="dash-employees-admin"
                        value={data?.administrativeEmployeesCount ?? 0}
                        loading={isFetching}
                        onArrowUpClick={() => navigate("/employees")} />
                    <KpiCard
                        label="Personal docente registrado"
                        icon={BookOpen}
                        tone="amber"
                        hint="Cantidad de personal docente registrados"
                        testid="dash-employees-teachers"
                        value={data?.teachersEmployeesCount ?? 0}
                        loading={isFetching}
                        onArrowUpClick={() => navigate("/employees")} />
                    <KpiCard
                        label="Roles de seguridad registrados"
                        icon={Shield}
                        tone="primary"
                        hint="Cantidad de roles de seguridad registrados"
                        testid="dash-security-roles"
                        value={data?.securityRolesCount ?? 0}
                        loading={isFetching}
                        onArrowUpClick={() => navigate("/security-roles")} />
                    <KpiCard
                        label="Puestos de trabajo registrados"
                        icon={BriefcaseBusiness}
                        tone="emerald"
                        hint="Cantidad de puestos de trabajo registrados"
                        testid="dash-job-titles"
                        value={data?.jobTitlesCount ?? 0}
                        loading={isFetching}
                        onArrowUpClick={() => navigate("/job-titles")} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <div className="col-span-1 lg:col-span-6">
                        <LatestTeachersTable data={teachers} loading={isFetchingTeachers} />
                    </div>
                    <div className="col-span-1 lg:col-span-4">
                        <QuickAccess />
                    </div>
                </div>
            </section>
        </>
    )
}
