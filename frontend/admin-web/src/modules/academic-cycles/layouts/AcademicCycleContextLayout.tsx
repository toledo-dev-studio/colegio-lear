
import { matchPath, Navigate, Outlet, useLocation, useParams } from "react-router";
import { CalendarDays, GraduationCap, School, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import type { Tab } from "@/interfaces/components/tab";
import { useGetAcademicCycleById } from "../hooks/academic-cycles/useGetAcademicCycleById";
import type { AcademicCycleLayoutContext } from "../interfaces/academic-cycle-layout-context";
import { AcademicCycleTabSkeleton } from "../pages/academic-cycle/academic-cycle-tab/AcademicCycleTabSkeleton";
import { usePermission } from "@/modules/auth/hooks/usePermission";

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
        loggedInUserCanWrite: usePermission("academic-cycles", "can-write")
    }

    if (isNew && isProtectedRoute) {
        return <Navigate to="/academic-cycles/new" />;
    }

    if (academicCycleQuery.isError) {
        showApiErrorToast(academicCycleQuery.error, "No fue posible obtener la información del ciclo escolar");
        return <Navigate to="/academic-cycles" />;
    }

    if (academicCycleQuery.isLoading) {
        return (
            <>
                <AcademicCycleTabSkeleton isNew={isNew} />
            </>
        )
    }

    // Check if try to access to enrollment page when academic cycle has "upcoming" status
    if(academicCycleQuery.data?.status === "upcoming" && matchPath("/academic-cycles/:id/enrollments/:enrollmentId", pathname) !== null) {
        toast.error("No es posible obtener la información de la inscrpción hasta que el ciclo escolar cambie de estatus a \"En curso\"", { position: "top-right" });
        return <Navigate to={`/academic-cycles/${academicCycleQuery.data.id}`} />;
    }

    return (
        <>
            <Outlet context={context} />
        </>
    )
}
