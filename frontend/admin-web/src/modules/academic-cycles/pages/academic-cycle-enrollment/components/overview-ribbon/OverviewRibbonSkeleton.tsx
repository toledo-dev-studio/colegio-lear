import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const OverviewRibbonSkeleton = () => {
    return (
        <>
            <section className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 w-full animate-pulse">

                <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mx-auto">

                    {Array.from({ length: 4 }).map((_, index) => (
                        <section key={index} className="flex items-center gap-3">

                            {/* Icon */}
                            <Skeleton className="w-9 h-9 rounded-full shrink-0" />

                            {/* Content */}
                            <section className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-40" />
                            </section>

                        </section>
                    ))}

                </section>

                <section className="flex flex-col gap-y-2 mt-4 sm:mt-6">
                    <Skeleton className="h-3 w-80" />
                </section>

            </section>
        </>
    )
}
