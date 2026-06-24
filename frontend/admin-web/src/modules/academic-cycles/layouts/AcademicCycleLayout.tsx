import { matchPath, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { CalendarDays, GraduationCap, School, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/extensions/utils";
import type { Tab } from "@/interfaces/components/tab";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
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
    // Component hooks & stores
    const { id } = useParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const academicCycleQuery = useGetAcademicCycleById({ id: id! });

    // Constant configuration variables
    const isNew = id === "new";
    const title = isNew ? "Registro de ciclo escolar" : "Edición de ciclo escolar";
    const isProtectedRoute = TABS.some(tab => tab.protected && pathname.endsWith(tab.to));

    // Layout context information
    const context: AcademicCycleLayoutContext = {
        isNew: isNew,
        academicCycleId: id,
        academicCycle: academicCycleQuery.data,
        isActive: (academicCycleQuery.data?.status === "active"),
        isLocked: (academicCycleQuery.data?.status !== "upcoming" && academicCycleQuery.data?.status !== undefined),
    }

    // Component functions
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
                    <Breadcrumb items={[
                        { label: "Seguimiento escolar" },
                        { label: "Ciclos escolares", to: "/academic-cycles" },
                        { label: isNew ? "Nuevo ciclo escolar" : academicCycleQuery.data?.code || "Edición de ciclo escolar" },
                    ]} />
                </div>

                <PageTitle
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
                                <CardAlert 
                                    type="info" 
                                    title="RECORDATORIO SOBRE EL REGISTRO DE CICLO ESCOLAR" 
                                    message="Una vez guardada la información general del ciclo escolar podrás agregar información complementaria tales como gestión de grupos, materias, docentes y estudiantes inscritos en el ciclo escolar." />
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
