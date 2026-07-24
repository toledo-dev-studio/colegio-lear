import { Skeleton } from "@/shared/ui/skeleton"

export const StudentGradesGridSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 animate-pulse">

            {/* Header */}
            <header className="flex items-center gap-3 pb-3 border-b border-border">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-3 w-full max-w-lg" />
                </div>
            </header>

            {/* Main content */}
            <section className="grid grid-cols-1 2xl:grid-cols-3 gap-5">

                {/* Overall grade */}
                <section className="col-span-1">
                    <div className="rounded-xl border border-border p-6 space-y-5">

                        <div className="flex justify-center">
                            <Skeleton className="h-28 w-28 rounded-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40 mx-auto" />
                            <Skeleton className="h-3 w-56 mx-auto" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-16 rounded-lg" />
                            <Skeleton className="h-16 rounded-lg" />
                        </div>

                        <Skeleton className="h-12 rounded-lg w-full" />

                    </div>
                </section>

                {/* Right content */}
                <section className="grid 2xl:col-span-2 gap-5">

                    {/* Highlight cards */}
                    <section className="grid grid-cols-2 gap-3">

                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-border p-4 space-y-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className="h-5 w-40" />
                                    </div>
                                </div>

                                <Skeleton className="h-8 w-20" />
                            </div>
                        ))}

                    </section>

                    {/* Grades table */}
                    <section className="rounded-xl border border-border overflow-hidden">

                        {/* Header */}
                        <div className="border-b border-border p-4">
                            <Skeleton className="h-5 w-52" />
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-border">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 items-center gap-4 p-4"
                                >
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-24 rounded-full justify-self-end" />
                                </div>
                            ))}
                        </div>

                    </section>

                </section>

            </section>

            {/* Footer */}
            <Skeleton className="h-3 w-136" />

        </section>
    )
}
