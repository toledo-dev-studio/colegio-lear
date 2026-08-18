import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const StudentWalletPaymentsTableSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-1.5 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">

            {/* Header */}
            <header className="flex items-center gap-3 pb-3 border-b border-border">
                <Skeleton className="w-10 h-10 rounded-full" />

                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-3 w-72" />
                </div>
            </header>

            {/* Table */}
            <section className="table-container">

                <table className="table">

                    <thead>
                        <tr>
                            <th className="column">
                                <Skeleton className="h-4 w-24" />
                            </th>

                            <th className="column">
                                <Skeleton className="h-4 w-32" />
                            </th>

                            <th className="column">
                                <Skeleton className="h-4 w-24" />
                            </th>

                            <th className="column">
                                <Skeleton className="h-4 w-24" />
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        {Array.from({ length: 6 }).map((_, index) => (
                            <tr key={index}>

                                <td className="row">
                                    <Skeleton className="h-5 w-28" />
                                </td>

                                <td className="row">
                                    <Skeleton className="h-5 w-48" />
                                </td>

                                <td className="row">
                                    <Skeleton className="h-5 w-24" />
                                </td>

                                <td className="row">
                                    <Skeleton className="h-8 w-28 rounded-full" />
                                </td>

                            </tr>
                        ))}

                        {/* Totals */}
                        <tr className="bg-muted/50">
                            <td className="column">
                                <Skeleton className="h-5 w-20" />
                            </td>

                            <td className="column"></td>

                            <td className="column">
                                <Skeleton className="h-5 w-24 ml-auto" />
                            </td>

                            <td className="column"></td>
                        </tr>

                    </tbody>

                </table>

            </section>

        </section>
    );
};