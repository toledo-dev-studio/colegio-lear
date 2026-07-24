
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { CalendarDays, GraduationCap, School, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import type { Tab } from "@/interfaces/components/tab";
import { useGetAcademicCycleById } from "../hooks/academic-cycles/useGetAcademicCycleById";
import type { AcademicCycleLayoutContext } from "../interfaces/academic-cycle-layout-context";
import { AcademicCycleTabSkeleton } from "../pages/academic-cycle/academic-cycle-tab/AcademicCycleTabSkeleton";

export const TABS: Tab[] = [
    {
        to: "",
        label: "Información general",
        icon: CalendarDays,
        protected: false
    },
    {
        to: "wallet",
        label: "Cartera de pagos",
        icon: Wallet,
        protected: true
    },
    {
        to: "school-subjects",
        label: "Materias escolares",
        icon: GraduationCap,
        protected: true
    },
    {
        to: "school-groups",
        label: "Grupos escolares",
        icon: School,
        protected: true
    },
    {
        to: "enrollments",
        label: "Inscripción a estudiantes",
        icon: Users,
        protected: true
    }
];

export const AcademicCycleContextLayout = () => {
    // Component hooks & stores
    const { id } = useParams();
    const { pathname } = useLocation();
    const academicCycleQuery = useGetAcademicCycleById({ id: id! });

    // Constant configuration variables
    const isNew = id === "new";
    const isProtectedRoute = TABS.some(tab => tab.protected && pathname.endsWith(tab.to));

    // Layout context information
    const context: AcademicCycleLayoutContext = {
        isNew: isNew,
        academicCycleId: id,
        academicCycle: academicCycleQuery.data,
        isActive: (academicCycleQuery.data?.status === "active"),
        isLocked: (academicCycleQuery.data?.status !== "upcoming" && academicCycleQuery.data?.status !== undefined),
        enrollmentOpen: academicCycleQuery.data?.enrollmentOpen || false,
    }

    if (isNew && isProtectedRoute) {
        return <Navigate to="/academic-cycles/new" />;
    }

    if (academicCycleQuery.isError) {
        toast.error("No fue posible obtener la información del ciclo escolar", { position: "top-right" });
        return <Navigate to="/academic-cycles" />;
    }

    if (academicCycleQuery.isLoading) {
        return (
            <>
                <AcademicCycleTabSkeleton isNew={isNew} />
            </>
        )
    }

    return (
        <>
            <Outlet context={context} />
        </>
    )
}
