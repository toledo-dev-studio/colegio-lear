import { Skeleton } from "@/shared/shadcn/ui/skeleton";

// Skeleton de la sección de datos personales del alumno

export const PersonalDataSectionSkeleton = () => {
    return (
        <>
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                {Array.from({ length: 9 }).map((_, index) => (
                    <section key={index} className="flex items-center gap-3 animate-pulse">

                        {/* Icon */}
                        <Skeleton className="w-9 h-9 rounded-full shrink-0" />

                        {/* Content */}
                        <section className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </section>

                    </section>
                ))}

            </section>
        </>
    )
}