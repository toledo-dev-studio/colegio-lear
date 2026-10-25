import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const WalletStatsSkeleton = () => {
    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">

                {Array.from({ length: 4 }).map((_, index) => (
                    <section key={index} className="bg-card border border-border rounded-xl shadow-sm p-4 flex items-center gap-3 animate-pulse">

                        {/* Icon */}
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />

                        {/* Content */}
                        <section className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-32" />
                        </section>

                    </section>
                ))}

            </section>
        </>
    )
}
