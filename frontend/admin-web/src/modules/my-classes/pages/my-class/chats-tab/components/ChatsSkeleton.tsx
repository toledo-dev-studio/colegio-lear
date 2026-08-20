import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const ChatsSkeleton = () => {
    return (
        <section className="flex flex-col lg:flex-row flex-1 min-h-128">

            {/* Students list skeleton */}
            <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-border">
                <section className="flex flex-col divide-y divide-border">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <section key={index} className="flex items-center gap-3 px-4 py-3">
                            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                            <section className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-20" />
                            </section>
                        </section>
                    ))}
                </section>
            </aside>

            {/* Chat window skeleton */}
            <section className="flex-1 min-w-0 flex flex-col">
                <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <section className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                    </section>
                </header>
                <section className="flex-1 px-4 py-4 flex flex-col gap-3 min-h-64">
                    <Skeleton className="h-10 w-56 self-start rounded-2xl" />
                    <Skeleton className="h-10 w-64 self-end rounded-2xl" />
                    <Skeleton className="h-10 w-48 self-start rounded-2xl" />
                </section>
                <footer className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/20">
                    <Skeleton className="h-10 flex-1 rounded-2xl" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                </footer>
            </section>
        </section>
    );
}