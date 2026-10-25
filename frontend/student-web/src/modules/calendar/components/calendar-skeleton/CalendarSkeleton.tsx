import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const CalendarSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

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
    )
}