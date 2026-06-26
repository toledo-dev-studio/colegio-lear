import { matchPath, Outlet, useLocation, useNavigate, useOutletContext } from "react-router";

import { cn } from "@/lib/extensions/utils";
import { TABS } from "./AcademicCycleContextLayout";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import type { AcademicCycleLayoutContext } from "../interfaces/academic-cycle-layout-context";

export const AcademicCycleLayout = () => {
    // Get context from main layout
    const context = useOutletContext<AcademicCycleLayoutContext>();
    const { isNew, academicCycle } = context;    

    // Component hooks & stores
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Constant configuration variables
    const title = isNew ? "Registro de ciclo escolar" : "Edición de ciclo escolar";

    // Component functions
    const isActiveRoute = (to: string): boolean => {
        if (to === "") {
            return matchPath("/academic-cycles/:id", pathname) !== null;
        }
        return pathname.endsWith(to);
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <Breadcrumb items={[
                        { label: "Seguimiento escolar" },
                        { label: "Ciclos escolares", to: "/academic-cycles" },
                        { label: isNew ? "Nuevo ciclo escolar" : academicCycle?.code || "Edición de ciclo escolar" },
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
