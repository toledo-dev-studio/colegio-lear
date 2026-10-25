import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const AcademicCycleSchoolGroupFormSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

            {/* General information */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            {/* Fields */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="control-container">
                    <Skeleton className="h-4 w-52 mb-3" />
                    <Skeleton className="h-12 w-full rounded-full" />
                </div>

                <div className="control-container">
                    <Skeleton className="h-4 w-40 mb-3" />
                    <Skeleton className="h-12 w-full rounded-full" />
                </div>

            </section>

            <section className="grid grid-cols-1 gap-8">

                <div className="control-container">
                    <Skeleton className="h-4 w-28 mb-3" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                </div>

            </section>

            {/* Schedule section */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-80" />
                <Skeleton className="h-4 w-xl" />
            </div>

            {/* Schedule calendar */}
            <section className="flex flex-col gap-y-6">

                <Skeleton className="h-16 w-full rounded-xl" />

                <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <th key={index} className="p-4">
                                        <Skeleton className="h-4 w-20 mx-auto" />
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from({ length: 8 }).map((_, row) => (
                                <tr key={row} className="border-b border-border last:border-none">
                                    {Array.from({ length: 6 }).map((_, col) => (
                                        <td key={col} className="p-3">
                                            <Skeleton className="h-14 w-full rounded-lg" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </section>

        </section>
    );
};