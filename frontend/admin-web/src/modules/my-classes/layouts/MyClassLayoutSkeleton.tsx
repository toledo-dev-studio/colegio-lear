import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { PageTitle } from "@/shared/components/page-title/PageTitle";

export const MyClassLayoutSkeleton = () => {
    return (
        <section className="w-full py-12 px-10 lg:px-15">

            {/* Breadcrumb */}
            <div className="mb-10">
                <Breadcrumb items={[
                    { label: "Mis clases", to: "/my-classes" },
                    { label: "Clase" },
                ]} />
            </div>

            {/* Page title */}
            <PageTitle
                title="Cargando clase..."
                subtitle="Consulta y administra los grupos escolares que tienes asignados en el colegio" />

            <section className="flex-1 animate-pulse">
                <section className="flex flex-col min-h-full gap-5">

                    {/* Tabs */}
                    <div className="border-b border-default overflow-x-auto no-scrollbar w-full">
                        <ul className="flex flex-row gap-6 py-2">
                            {Array.from({ length: 1 }).map((_, index) => (
                                <li key={index}>
                                    <Skeleton className="h-10 w-40 rounded-md" />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Router Outlet */}
                    <div className="w-full flex flex-col gap-y-6">

                        <section className="flex flex-col gap-y-6">

                            {/* Section title */}
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-96" />
                                <Skeleton className="h-4 w-xl" />
                            </div>

                            {/* Date filter */}
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-72" />
                                <Skeleton className="h-11 w-72 rounded-full" />
                            </div>

                            {/* Table */}
                            <div className="space-y-4">
                                <Skeleton className="h-5 w-96" />
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <Skeleton key={index} className="h-10 w-full rounded-md" />
                                ))}
                            </div>
                        </section>
                    </div>
                </section>
            </section>
        </section>
    )
}