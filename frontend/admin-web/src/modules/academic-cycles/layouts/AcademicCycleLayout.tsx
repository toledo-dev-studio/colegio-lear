import { toast } from "sonner";
import { matchPath, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { CalendarDays, GraduationCap, InfoIcon, School, Users, Wallet } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import type { Tab } from "@/interfaces/components/tab";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useGetAcademicCycleById } from "../hooks/academic-cycles/useGetAcademicCycleById";
import type { AcademicCycleLayoutContext } from "../interfaces/academic-cycle-layout-context";

const TABS: Tab[] = [
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
        label: "Inscripciones al ciclo escolar",
        icon: Users,
        protected: true
    }
];

export const AcademicCycleLayout = () => {

    // Hooks & stores
    const { id } = useParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const academicCycleQuery = useGetAcademicCycleById(id || "");

    // Constant configuration variables
    const isNew = id === "new";
    const title = isNew ? "Registro de ciclo escolar" : "Edición de ciclo escolar";

    // Layout context information
    const context: AcademicCycleLayoutContext = {
        academicCycle: academicCycleQuery.data,
        academicCycleId: id,
        isNew: isNew,
        isLocked: (academicCycleQuery.data?.status !== "upcoming" && academicCycleQuery.data?.status !== undefined),
        isActive: (academicCycleQuery.data?.status === "active")
    }

    const isProtectedRoute = TABS.some(tab => tab.protected && pathname.endsWith(tab.to));

    const isActiveRoute = (to: string): boolean => {
        if (to === "") {
            return matchPath("/academic-cycles/:id", pathname) !== null;
        }
        return pathname.endsWith(to);
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
                <div className="w-full relative mx-auto h-full mt-30">
                    <CustomFullScreenLoading title="Cargando información" subtitle="Por favor espere..." />
                </div>
            </>
        )
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <CustomBreadcrumb items={[
                        { label: "Seguimiento escolar" },
                        { label: "Ciclos escolares", to: "/academic-cycles" },
                        { label: isNew ? "Nuevo ciclo escolar" : academicCycleQuery.data?.code || "Edición de ciclo escolar" },
                    ]} />
                </div>

                <CustomPageTitle
                    title={title}
                    subtitle="Gestiona la información de los ciclos escolares que estará disponible en la organización" />

                <div className="flex-1">
                    <div className="flex flex-col min-h-full gap-5 mt-6">

                        {/* Form tabs */}
                        <div className="border-b border-default overflow-x-auto no-scrollbar w-full">
                            <ul className="flex flex-row text-sm font-medium text-muted-foreground">
                                {
                                    TABS.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <li key={tab.to} className="mr-2 text-nowrap">
                                                <button
                                                    onClick={() => navigate(tab.to)}
                                                    disabled={(tab.to !== "" && isNew)}
                                                    className={
                                                        cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition transition-all",
                                                            isActiveRoute(tab.to) && "border-primary text-primary",
                                                            (tab.to !== "" && isNew) && "cursor-not-allowed opacity-50"
                                                        )}>
                                                    <Icon className={
                                                        cn("w-4 h-4 me-2 text-muted-foreground group-hover:text-fg-brand",
                                                            isActiveRoute(tab.to) && "text-primary"
                                                        )} aria-hidden="true" />
                                                    {tab.label}
                                                </button>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>

                        {
                            isNew && (
                                <div className="flex flex-col items-start gap-y-4 border-b border-border mt-2 mb-2 border-solid border p-6 rounded-xl bg-primary/90 dark:bg-primary/20">
                                    <h2 className="w-full text-white flex gap-x-4 items-center">
                                        <InfoIcon /> RECORDATORIO SOBRE EL REGISTRO DE CICLO ESCOLAR
                                    </h2>
                                    <p className="text-xs text-white">
                                        Una vez guardada la información general del ciclo escolar podrás agregar información complementaria tales como gestión de grupos, materias, docentes y estudiantes inscritos en el ciclo escolar.
                                    </p>
                                </div>
                            )
                        }

                        {/* Router outlet container */}
                        <div className="w-full flex flex-col gap-y-6">
                            <Outlet context={context} />
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
