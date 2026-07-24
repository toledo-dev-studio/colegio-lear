import { Skeleton } from "@/shared/ui/skeleton";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { PageTitle } from "@/shared/components/page-title/PageTitle";

interface Props {
    isNew: boolean;
}

export const AcademicCycleTabSkeleton = ({ isNew }: Props) => {
    const title = isNew ? "Registro de ciclo escolar" : "Edición de ciclo escolar";

    return (
        <section className="w-full py-12 px-10 lg:px-15">

            {/* Breadcrumb */}
            <div className="mb-10">
                <Breadcrumb items={[
                    { label: "Seguimiento escolar" },
                    { label: "Ciclos escolares", to: "/academic-cycles" },
                    { label: isNew ? "Nuevo ciclo escolar" : "Edición de ciclo escolar" },
                ]} />
            </div>

            {/* Page title */}
            <PageTitle
                title={title}
                subtitle="Gestiona la información de los ciclos escolares que estará disponible en la organización" />

            <section className="flex-1 animate-pulse">
                <section className="flex flex-col min-h-full gap-5">

                    {/* Tabs */}
                    <div className="border-b border-default overflow-x-auto no-scrollbar w-full">
                        <ul className="flex flex-row gap-6 py-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <li key={index}>
                                    <Skeleton className="h-10 w-40 rounded-md" />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Alert */}
                    <div className="rounded-xl border border-border p-6">
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-72" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                        </div>
                    </div>

                    {/* Router Outlet */}
                    <div className="w-full flex flex-col gap-y-6">

                        <section className="flex flex-col gap-y-6">

                            {/* General information */}
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-96" />
                                <Skeleton className="h-4 w-xl" />
                            </div>

                            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">

                                {/* Nombre */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-48 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                                {/* Código */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-44 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                                {/* Tipo periodo */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-40 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                                {/* Estado */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-44 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                                {/* Calificación mínima */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-52 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                    <Skeleton className="h-3 w-64 mt-2" />
                                </div>

                                {/* Evaluaciones */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-52 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                    <Skeleton className="h-3 w-60 mt-2" />
                                </div>

                            </section>

                            {/* Administration */}
                            <div className="space-y-2 pt-4">
                                <Skeleton className="h-7 w-120" />
                                <Skeleton className="h-4 w-2xl" />
                            </div>

                            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">

                                {/* Fecha inicio */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-48 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                                {/* Fecha fin */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-48 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                                {/* Nivel académico */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-40 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                                {/* Nivel educativo */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-40 mb-3" />
                                    <Skeleton className="h-11 w-full rounded-xl" />
                                </div>

                            </section>

                            {/* Additional information */}
                            <section className="grid grid-cols-1 gap-8">

                                {/* Switch */}
                                <div className="control-container">

                                    <Skeleton className="h-4 w-52 mb-3" />

                                    <div className="switch-control-container">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-44" />
                                            <Skeleton className="h-3 w-80" />
                                        </div>

                                        <Skeleton className="h-6 w-12 rounded-full" />
                                    </div>

                                </div>

                                {/* Observaciones */}
                                <div className="control-container">
                                    <Skeleton className="h-4 w-44 mb-3" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                </div>

                            </section>

                        </section>

                    </div>

                </section>
            </section>

        </section>
    )
}
