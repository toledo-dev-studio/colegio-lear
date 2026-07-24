import { Skeleton } from "@/shared/ui/skeleton";

export const AcademicLevelFormSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

            {/* General section */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            <section className="grid grid-cols-1 gap-8">

                <div className="control-container">
                    <Skeleton className="h-4 w-72 mb-3" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                <div className="control-container">
                    <Skeleton className="h-4 w-40 mb-3" />

                    <div className="switch-control-container">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-72" />
                        </div>

                        <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                </div>

                <div className="control-container">
                    <Skeleton className="h-4 w-56 mb-3" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>

            </section>

            {/* Education levels section */}
            <div className="space-y-2 pt-6">
                <Skeleton className="h-7 w-md" />
                <Skeleton className="h-4 w-xl" />
            </div>

            <div className="w-full rounded-2xl border border-border bg-muted/50 p-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-6">

                    <div className="space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>

                    <Skeleton className="h-10 w-40 rounded-xl" />

                </div>

                {/* Education Levels */}
                <div className="grid gap-4">

                    {
                        Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-border bg-background p-6"
                            >
                                <div className="flex items-center justify-between">

                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-56" />
                                        <Skeleton className="h-4 w-80" />
                                    </div>

                                    <Skeleton className="h-10 w-10 rounded-full" />

                                </div>
                            </div>
                        ))
                    }

                </div>

            </div>

        </section>
    )
}
