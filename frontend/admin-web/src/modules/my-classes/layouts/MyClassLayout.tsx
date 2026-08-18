import { matchPath, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/extensions/utils";
import type { Tab } from "@/interfaces/components/tab";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { useGetMyClassById } from "../hooks/useGetMyClassById";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { MyClassLayoutSkeleton } from "./MyClassLayoutSkeleton";
import { useGetAcademicCycleById } from "@/modules/academic-cycles/hooks/academic-cycles/useGetAcademicCycleById";
import type { MyClassLayoutContext } from "../interfaces/my-class-layout-context";
import { useGetAcademicCycleSchoolGroupById } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useGetAcademicCycleSchoolGroupById";
import type { MyClassResponse } from "@/interfaces/responses/my-class.response";

const TABS: Tab[] = [
    {
        to: "",
        label: "Asistencias",
        icon: ClipboardCheck,
        protected: false
    }
];

interface TabsProps {
    id: string;
    myClass: MyClassResponse;
}

const MyClassTabs = ({ id, myClass }: TabsProps) => {
    // Component hooks & stores
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Reuse existing queries of the academic cycle module
    const academicCycleId = myClass.academicCycle?.id;
    const academicCycleQuery = useGetAcademicCycleById({ id: academicCycleId! });
    const schoolGroupQuery = useGetAcademicCycleSchoolGroupById({ id, academicCycleId: academicCycleId! });

    // Layout context information
    const context: MyClassLayoutContext = {
        myClass: myClass,
        myClassId: id,
        academicCycleId: academicCycleId,
        academicCycle: academicCycleQuery.data,
        schoolGroup: schoolGroupQuery.data,
        loggedInUserCanWrite: usePermission("my-classes", "can-write")
    };

    // Component functions
    const isActiveRoute = (to: string): boolean => {
        if (to === "") {
            return matchPath("/my-classes/:id", pathname) !== null;
        }
        return pathname.endsWith(to);
    }

    if (academicCycleQuery.isError || schoolGroupQuery.isError) {
        toast.error("No fue posible obtener la información de la clase", { position: "top-right" });
        return <Navigate to="/my-classes" />;
    }

    if (academicCycleQuery.isLoading || schoolGroupQuery.isLoading) {
        return <MyClassLayoutSkeleton />;
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <Breadcrumb items={[
                        { label: "Mis clases", to: "/my-classes" },
                        { label: myClass.name },
                    ]} />
                </div>

                <PageTitle
                    title={myClass.name}
                    subtitle="Consulta y administra los grupos escolares que tienes asignados en el colegio" />

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
                                                    className={
                                                        cn("cursor-pointer inline-flex items-center justify-center p-4 border-b border-transparent rounded-t-base hover:text-fg-brand hover:border-brand group transition-all",
                                                            isActiveRoute(tab.to) && "border-primary text-primary"
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

export const MyClassLayout = () => {
    // Component hooks & stores
    const { id } = useParams();
    const myClassQuery = useGetMyClassById({ id: id! });

    if (myClassQuery.isError) {
        toast.error("No fue posible obtener la información de la clase", { position: "top-right" });
        return <Navigate to="/my-classes" />;
    }

    if (myClassQuery.isLoading || !myClassQuery.data) {
        return <MyClassLayoutSkeleton />;
    }

    return <MyClassTabs id={id!} myClass={myClassQuery.data} />;
}

export default MyClassLayout;