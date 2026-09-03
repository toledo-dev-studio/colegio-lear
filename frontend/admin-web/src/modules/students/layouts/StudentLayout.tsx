import { matchPath, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { CalendarDays, HeartPlus, ShieldPlus, UserCircle2 } from "lucide-react";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { cn } from "@/lib/extensions/utils";
import type { Tab } from "@/interfaces/components/tab";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { useGetStudentById } from "../hooks/students/useGetStudentById";
import type { StudentLayoutContext } from "../interfaces/student-layout-context";
import { StudentTabSkeleton } from "../pages/student/student-tab/StudentTabSkeleton";
import { usePermission } from "@/modules/auth/hooks/usePermission";

const TABS: Tab[] = [
    {
        to: "",
        label: "Información general",
        icon: UserCircle2,
        protected: false
    },
    {
        to: "allergies",
        label: "Alergias & padecimientos",
        icon: HeartPlus,
        protected: true
    },
    {
        to: "guardians",
        label: "Tutores del estudiante",
        icon: ShieldPlus,
        protected: true
    },
    {
        to: "enrollments",
        label: "Ciclos escolares inscritos",
        icon: CalendarDays,
        protected: true
    }
];

export const StudentLayout = () => {
    // Component hooks & stores
    const { id } = useParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const studentQuery = useGetStudentById({ id: id! })

    // Layout context information
    const isNew = id === "new";
    const context: StudentLayoutContext = {
        isNew: isNew,
        studentId: id!,
        student: studentQuery.data!,
        loggedInUserCanWrite: usePermission("students", "can-write")
    };

    // Constant configuration variables
    const title = isNew ? "Registro de estudiante" : `${context.student?.name ?? ""} ${context.student?.firstLastName ?? ""} ${context.student?.secondLastName ?? ""}`;
    const isProtectedRoute = TABS.some(tab => tab.protected && pathname.endsWith(tab.to));

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
        showApiErrorToast(studentQuery.error, "No fue posible obtener la información del estudiante");
        return <Navigate to="/students" />;
    }

    if (studentQuery.isLoading) {
        return (
            <>
                <StudentTabSkeleton isNew={isNew} />
            </>
        )
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <Breadcrumb items={[
                        { label: "Seguimiento escolar" },
                        { label: "Estudiantes", to: "/students" },
                        { label: isNew ? "Nuevo estudiante" : studentQuery.data?.enrollment || "Edición de estudiante" },
                    ]} />
                </div>

                <PageTitle
                    title={title}
                    subtitle="Gestiona la información de los estudiantes que estará disponible en la organización" />

                <section className="flex-1">
                    <section className="flex flex-col min-h-full gap-5">

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
                                                        cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition-all",
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
                                    title="RECORDATORIO SOBRE EL REGISTRO DEL ESTUDIANTE"
                                    message="Una vez que guardes la información general del estudiante, el sistema generará automáticamente su matrícula. 
                                    A partir de ese momento, podrás dar seguimiento a su historial de ciclos escolares, administrar el registro de sus pagos y complementar su expediente con información médica.
                                    Además, podrás registrar a sus tutores legales para que tengan acceso al Portal del Alumno y reciban notificaciones importantes relacionadas con el estudiante."
                                />
                            )
                        }

                        {/* Router outlet container */}
                        <div className="w-full flex flex-col gap-y-6">
                            <Outlet context={context} />
                        </div>

                    </section>
                </section>
            </div>
        </>
    )
}
