// Skeleton de la página de detalle de una materia (datos generales + tareas)

import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const SchoolSubjectDetailSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">
            {/* Page title */}
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-3/5 max-w-xl" />
            </section>

            {/* General data */}
            <section className="card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                </div>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-2.5 w-14" />
                            <Skeleton className="h-3.5 w-32" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-2.5 w-24" />
                        <Skeleton className="h-7 w-44" />
                    </div>
                </section>
            </section>

            {/* Support materials */}
            <section className="card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
                <section className="flex flex-col gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-9 w-64 rounded-md" />
                    ))}
                </section>
            </section>

            {/* Tasks */}
            <section className="card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-52" />
                    </div>
                </div>
                <section className="flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                            <div className="pt-3 border-t border-border space-y-2">
                                <Skeleton className="h-3 w-40" />
                                <Skeleton className="h-7 w-52" />
                            </div>
                        </div>
                    ))}
                </section>
            </section>
        </section>
    );
}
