import { Skeleton } from "@/shared/ui/skeleton";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";

interface Props {
    isNew: boolean;
}

export const StudentTabSkeleton = ({ isNew }: Props) => {
    return (
        <section className="w-full py-12 px-10 lg:px-15">

            <div className="mb-10">
                <Breadcrumb items={[
                    { label: "Seguimiento escolar" },
                    { label: "Estudiantes", to: "/students" },
                    { label: isNew ? "Nuevo estudiante" : "Edición de estudiante" },
                ]} />
            </div>

            <PageTitle
                title={isNew ? "Registro de estudiante" : "Edición de estudiante"}
                subtitle="Gestiona la información de los estudiantes que estará disponible en la organización" />

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

                        <section className="flex flex-col gap-y-6 animate-pulse">

                            {/* Información general */}
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-96" />
                                <Skeleton className="h-4 w-lg" />
                            </div>

                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="space-y-3">
                                        <Skeleton className="h-4 w-44" />
                                        <Skeleton className="h-11 w-full rounded-md" />
                                    </div>
                                ))}

                                <div className="control-container col-span-1 md:col-span-2 xl:col-span-3 space-y-4">
                                    <Skeleton className="h-4 w-40" />
                                    <div className="flex items-center justify-between rounded-xl border border-border p-5">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-4 w-72" />
                                        </div>
                                        <Skeleton className="h-6 w-12 rounded-full" />
                                    </div>
                                </div>

                                <div className="control-container col-span-1 md:col-span-2 xl:col-span-3 space-y-3">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-28 w-full rounded-md" />
                                </div>

                            </section>

                            {/* Información médica */}
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-96" />
                                <Skeleton className="h-4 w-lg" />
                            </div>

                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-11 w-full rounded-md" />
                                </div>

                                <div className="control-container col-span-1 md:col-span-2 xl:col-span-3 space-y-3">
                                    <Skeleton className="h-4 w-60" />
                                    <Skeleton className="h-28 w-full rounded-md" />
                                </div>

                            </section>

                            {/* Datos de contacto */}
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-96" />
                                <Skeleton className="h-4 w-lg" />
                            </div>

                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                                {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className="space-y-3">
                                        <Skeleton className="h-4 w-44" />
                                        <Skeleton className="h-11 w-full rounded-md" />
                                    </div>
                                ))}

                            </section>

                            {/* Domicilio */}
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-96" />
                                <Skeleton className="h-4 w-lg" />
                            </div>

                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="space-y-3">
                                        <Skeleton className="h-4 w-44" />
                                        <Skeleton className="h-11 w-full rounded-md" />
                                    </div>
                                ))}

                            </section>

                        </section>

                    </div>

                </section>
            </section>

        </section>
    )
}
