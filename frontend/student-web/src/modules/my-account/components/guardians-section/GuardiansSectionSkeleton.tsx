import { Skeleton } from "@/shared/shadcn/ui/skeleton";

// Skeleton de la sección de tutores del alumno

export const GuardiansSectionSkeleton = () => {
    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {Array.from({ length: 2 }).map((_, index) => (
                    <section key={index} className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4 animate-pulse">

                        {/* Header */}
                        <section className="flex items-center gap-3">
                            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                            <section className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-20" />
                            </section>
                        </section>

                        {/* Contact */}
                        <section className="flex flex-col gap-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </section>

                        {/* Flags */}
                        <section className="flex gap-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </section>

                    </section>
                ))}

            </section>
        </>
    )
}