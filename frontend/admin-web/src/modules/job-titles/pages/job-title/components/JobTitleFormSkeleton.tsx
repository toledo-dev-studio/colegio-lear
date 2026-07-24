import { Skeleton } from "@/shared/ui/skeleton";

export const JobTitleFormSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

            {/* General section */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            <section className="flex items-center flex-col gap-8">

                {/* Nombre + Tipo */}
                <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="control-container">
                        <Skeleton className="h-4 w-56 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    <div className="control-container">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                </section>

                {/* Switch */}
                <div className="control-container">

                    <Skeleton className="h-4 w-36 mb-4" />

                    <div className="switch-control-container">

                        <div className="flex flex-col gap-2 flex-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-64" />
                        </div>

                        <Skeleton className="h-6 w-11 rounded-full" />

                    </div>

                </div>

                {/* Descripción */}
                <div className="control-container">
                    <Skeleton className="h-4 w-56 mb-2" />
                    <Skeleton className="h-32 w-full rounded-md" />
                </div>

            </section>

        </section>
    );
};