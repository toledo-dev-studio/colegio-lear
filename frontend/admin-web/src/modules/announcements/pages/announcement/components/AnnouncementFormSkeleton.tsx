import { Skeleton } from "@/shared/shadcn/ui/skeleton";

export const AnnouncementFormSkeleton = () => {
    return (
        <section className="flex flex-col gap-y-6">

            {/* General section */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-96" />
                <Skeleton className="h-4 w-lg" />
            </div>

            <div className="grid grid-cols-1 gap-8">

                {/* Campaign name */}
                <div className="control-container">
                    <Skeleton className="h-4 w-64 mb-3" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                {/* Audience */}
                <div className="control-container">
                    <Skeleton className="h-4 w-96 mb-3" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="control-container">
                        <Skeleton className="h-4 w-56 mb-3" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                        <Skeleton className="h-3 w-64 mt-2" />
                    </div>

                    <div className="control-container">
                        <Skeleton className="h-4 w-56 mb-3" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                        <Skeleton className="h-3 w-64 mt-2" />
                    </div>

                </div>

                {/* Status */}
                <div className="control-container">
                    <div className="control-container">
                        <Skeleton className="h-4 w-56 mb-3" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                        <Skeleton className="h-3 w-64 mt-2" />
                    </div>
                </div>

                {/* Description */}
                <div className="control-container">
                    <Skeleton className="h-4 w-56 mb-3" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>

            </div>

            {/* Attachments */}
            <section className="flex flex-col gap-y-4">

                <div className="space-y-2 pt-4">
                    <Skeleton className="h-7 w-80" />
                    <Skeleton className="h-4 w-full max-w-4xl" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mt-2">
                    {
                        Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="aspect-square rounded-2xl"
                            />
                        ))
                    }
                </div>

            </section>

            {/* TipTap */}
            <section className="flex flex-col gap-y-6">

                <div className="space-y-2">
                    <Skeleton className="h-7 w-80" />
                    <Skeleton className="h-4 w-xl" />
                </div>

                <div className="rounded-2xl border border-border overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 border-b border-border p-4">
                        {
                            Array.from({ length: 14 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-9 w-9 rounded-lg"
                                />
                            ))
                        }
                    </div>

                    {/* Editor */}
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-5/6" />

                        <Skeleton className="h-56 w-full rounded-xl my-6" />

                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-10/12" />
                        <Skeleton className="h-4 w-9/12" />
                    </div>

                </div>

            </section>

        </section>
    )
}
