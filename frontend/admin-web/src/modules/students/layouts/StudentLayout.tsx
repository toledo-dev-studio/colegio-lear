import { toast } from "sonner";
import { matchPath, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { CalendarDays, HeartPlus, InfoIcon, ShieldPlus, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import type { Tab } from "@/interfaces/components/tab";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useGetByIdStudentGeneralInformation } from "../hooks/students/useGetByIdStudentGeneralInformation";

const TABS: Tab[] = [
    {
        to: "",
        label: "Información general",
        icon: UserCircle2
    },
    {
        to: "medical-information",
        label: "Información médica",
        icon: HeartPlus
    },
    {
        to: "guardians",
        label: "Tutores del estudiante",
        icon: ShieldPlus
    },
    {
        to: "academic-cycles",
        label: "Ciclos escolares",
        icon: CalendarDays
    }
];

export const StudentLayout = () => {

    // Hooks & stores
    const { id } = useParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const studentQuery = useGetByIdStudentGeneralInformation(id || "");

    // Constant configuration variables
    const isNew = id === "new";
    const title = isNew ? "Registro de estudiante" : "Edición de estudiante";

    const protectedRoutes = ["/medical-information", "/guardians", "/payments", "/academic-cycles"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.endsWith(route));

    const isActiveRoute = (to: string): boolean => {
        if (to === "") {
            return matchPath("/students/:id", pathname) !== null;
        }
        return pathname.endsWith(to);
    }

    if (isNew && isProtectedRoute) {
        return <Navigate to="/students/new" />;
    }

    if (studentQuery.isError) {
        toast.error("No fue posible obtener la información del estudiante", { position: "top-right" });
        return <Navigate to="/students" />;
    }

    if (studentQuery.isLoading) {
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
                        { label: "Estudiantes", to: "/students" },
                        { label: isNew ? "Nuevo estudiante" : studentQuery.data?.enrollment || "Edición de estudiante" },
                    ]} />
                </div>

                <CustomPageTitle
                    title={title}
                    subtitle="Gestiona la información de los estudiantes que estará disponible en la organización" />

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
                                                    <Icon className="w-4 h-4 me-2 text-muted-foreground group-hover:text-fg-brand" aria-hidden="true" />
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
                                        <InfoIcon /> RECORDATORIO SOBRE EL REGISTRO DEL ESTUDIANTE
                                    </h2>
                                    <p className="text-xs text-white">
                                        Una vez guardada la información general del estudiante, se generará automáticamente su matrícula, de igual modo podrás dar seguimiento a los ciclos escolares, así como para llevar el registro de sus pagos, además de que podrás
                                        complementar su información general con su información médica, así como también agregar a sus tutores legales para que puedan tener acceso al portal del alumno y recibir notificaciones importantes sobre el estudiante.
                                    </p>
                                </div>
                            )
                        }

                        {/* Router outlet container */}
                        <div className="w-full flex flex-col gap-y-6">
                            <Outlet context={{ student: studentQuery.data, studentId: id, isNew: isNew }} />
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
