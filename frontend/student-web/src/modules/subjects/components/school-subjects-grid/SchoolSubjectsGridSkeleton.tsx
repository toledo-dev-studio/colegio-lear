// Skeleton de la grilla de materias escolares

import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const SchoolSubjectsGridSkeleton = () => {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                    </div>

                    <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-2.5 w-14" />
                                <Skeleton className="h-3.5 w-28" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-44" />
                    </div>
                </div>
            ))}
        </section>
    );
}
