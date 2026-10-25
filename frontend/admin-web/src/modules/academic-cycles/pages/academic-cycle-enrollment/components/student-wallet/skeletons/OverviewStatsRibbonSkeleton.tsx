import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const OverviewStatsRibbonSkeleton = () => {
    return (
        <section className="bg-card border border-border rounded-xl shadow-sm p-4 flex items-center gap-3 animate-pulse">

            {/* Icon */}
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />

            {/* Content */}
            <section className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-32" />
            </section>

        </section>
    )
}
