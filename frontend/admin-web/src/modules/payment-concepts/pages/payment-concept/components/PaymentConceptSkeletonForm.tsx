import { Skeleton } from "@/shared/ui/skeleton";

export const PaymentConceptSkeletonForm = () => {
    return (
        <>
            <>
                <section className="flex flex-col gap-y-6">

                    <div className="space-y-2">
                        <Skeleton className="h-7 w-96" />
                        <Skeleton className="h-4 w-lg" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Nombre */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-52" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>

                        {/* Código */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-3 w-52" />
                        </div>

                        {/* Monto */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-3 w-52" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Activo */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-28" />
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-64" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        </div>

                        {/* Condonación */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-72" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-3 lg:col-span-2">
                            <Skeleton className="h-4 w-60" />
                            <Skeleton className="h-32 w-full rounded-md" />
                        </div>
                    </div>

                    {/* Botones */}
                    <section className="flex justify-end gap-4 border-t border-border pt-8">
                        <Skeleton className="h-10 w-28 rounded-md" />
                        <Skeleton className="h-10 w-36 rounded-md" />
                    </section>

                </section>
            </>
        </>
    )
}
