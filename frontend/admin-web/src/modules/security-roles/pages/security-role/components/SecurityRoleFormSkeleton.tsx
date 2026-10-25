import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const SecurityRoleFormSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

            {/* General section */}
            <div className="space-y-2">
                <Skeleton className="h-6 max-w-96" />
                <Skeleton className="h-4 max-w-lg" />
            </div>

            <div className="flex flex-col gap-y-8">

                {/* Name */}
                <div className="control-container">
                    <Skeleton className="h-4 w-56 mb-2" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>

                {/* Active */}
                <div className="control-container">
                    <Skeleton className="h-4 w-40 mb-2" />

                    <div className="switch-control-container">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 max-w-72" />
                        </div>

                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                </div>

                {/* Description */}
                <div className="control-container">
                    <Skeleton className="h-4 w-56 mb-2" />
                    <Skeleton className="h-28 w-full rounded-lg" />
                </div>

            </div>

            {/* Permissions */}
            <div className="space-y-2 mt-4">
                <Skeleton className="h-6 max-w-120" />
                <Skeleton className="h-4 max-w-2xl" />
            </div>

            <div className="overflow-x-auto">

                <table className="w-full min-w-100 border border-border rounded-2xl overflow-hidden">

                    <tbody>

                        {
                            Array.from({ length: 10 }).map((_, index) => (

                                <tr key={index} className="border-b last:border-0">

                                    {/* Module */}
                                    <td className="border-r px-8 py-6">

                                        <div className="space-y-2">

                                            <Skeleton className="h-3 w-16" />

                                            <Skeleton className="h-5 w-40" />

                                        </div>

                                    </td>

                                    {/* Permissions */}
                                    <td className="px-8 py-6">

                                        <div className="flex gap-12">

                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-6 w-11 rounded-full" />
                                            </div>

                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-6 w-11 rounded-full" />
                                            </div>

                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-6 w-11 rounded-full" />
                                            </div>

                                        </div>

                                    </td>

                                </tr>

                            ))
                        }

                    </tbody>

                </table>

            </div>

        </section>
    );
};