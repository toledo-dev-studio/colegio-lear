import { Skeleton } from "@/shared/ui/skeleton";

export const SchoolSubjectFormSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

            {/* Section Title */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Nombre */}
                <div className="control-container">
                    <Skeleton className="h-4 w-56 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* Nivel académico */}
                <div className="control-container">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* grado educativo */}
                <div className="control-container">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* Espacio para mantener el layout de dos columnas */}
                <div />

                {/* Switch */}
                <div className="control-container md:col-span-2">

                    <Skeleton className="h-4 w-36 mb-4" />

                    <div className="switch-control-container">

                        <div className="flex flex-col gap-2 flex-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-72" />
                        </div>

                        <Skeleton className="h-6 w-11 rounded-full" />

                    </div>

                </div>

                {/* Descripción */}
                <div className="control-container lg:col-span-2">
                    <Skeleton className="h-4 w-56 mb-2" />
                    <Skeleton className="h-32 w-full rounded-md" />
                </div>

            </div>

        </section>
    );
};