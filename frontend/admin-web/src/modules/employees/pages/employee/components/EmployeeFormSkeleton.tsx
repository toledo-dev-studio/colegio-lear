import { Skeleton } from "@/shared/ui/skeleton";

export const EmployeeFormSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

            {/* ========================================= */}
            {/* Información general */}
            {/* ========================================= */}

            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">

                {/* Fotografía */}
                <div className="w-full flex flex-col items-center">

                    <Skeleton className="w-48 h-48 rounded-full" />

                    <Skeleton className="h-4 w-40 mt-6" />
                    <Skeleton className="h-3 w-56 mt-2" />

                    <Skeleton className="h-10 w-44 rounded-md mt-8" />

                </div>

                {/* Datos personales */}
                <section className="w-full md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="control-container">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    <div className="control-container">
                        <Skeleton className="h-4 w-56 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    <div className="control-container">
                        <Skeleton className="h-4 w-56 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    <div className="control-container">
                        <Skeleton className="h-4 w-56 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                </section>

            </section>

            {/* ========================================= */}
            {/* Organización */}
            {/* ========================================= */}

            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">

                <div className="control-container">
                    <Skeleton className="h-4 w-56 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                <div className="control-container">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                <div className="control-container">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                <div className="control-container">
                    <Skeleton className="h-4 w-44 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* Switch */}
                <div className="control-container md:col-span-2">

                    <Skeleton className="h-4 w-36 mb-4" />

                    <div className="switch-control-container">

                        <div className="flex flex-col gap-2 flex-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-72" />
                        </div>

                        <Skeleton className="w-11 h-6 rounded-full" />

                    </div>

                </div>

            </section>

            {/* ========================================= */}
            {/* Permisos */}
            {/* ========================================= */}

            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            <div className="mt-8 rounded-2xl border border-border overflow-hidden">

                {
                    Array.from({ length: 10 }).map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[260px_1fr] border-b last:border-b-0"
                        >

                            {/* Nombre del módulo */}
                            <div className="px-8 py-5 border-r">

                                <Skeleton className="h-3 w-20 mb-2" />

                                <Skeleton className="h-5 w-40" />

                            </div>

                            {/* Permisos */}
                            <div className="flex gap-10 items-center px-8 py-5">

                                {
                                    Array.from({ length: 3 }).map((__, permissionIndex) => (
                                        <div
                                            key={permissionIndex}
                                            className="flex flex-col gap-2"
                                        >
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="w-11 h-6 rounded-full" />
                                        </div>
                                    ))
                                }

                            </div>

                        </div>
                    ))
                }

            </div>

        </section>
    );
};