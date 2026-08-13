import { Skeleton } from "@/shared/shadcn/ui/skeleton";

// Skeleton de la sección de alergias del alumno

export const AllergiesSectionSkeleton = () => {
    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {Array.from({ length: 2 }).map((_, index) => (
                    <section key={index} className="bg-card border border-border rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4 animate-pulse">

                        <section className="flex items-center gap-3 flex-1">
                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                            <section className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </section>
                        </section>

                        <Skeleton className="h-5 w-24 rounded-full shrink-0" />

                    </section>
                ))}

            </section>
        </>
    )
}