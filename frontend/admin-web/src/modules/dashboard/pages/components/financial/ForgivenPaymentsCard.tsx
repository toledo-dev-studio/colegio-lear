import React from "react";
import { ArrowUpRight, HandHeart } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatMoney } from "@/lib/extensions/formatters";

interface Props {
    count?: number;
    totalAmount?: number;
    currency?: string;
    loading?: boolean;
}

export const ForgivenPaymentsCard: React.FC<Props> = ({ count, totalAmount, currency, loading }) => (
    <>
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4" data-testid="dash-payments-forgiven">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-violet-500/10 text-violet-600">
                    <HandHeart className="w-5 h-5" />
                </div>
                <ArrowUpRight className={cn("w-4 h-4 text-muted-foreground")} />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Pagos condonados</p>
                    {loading ? (
                        <Skeleton className="h-7 w-16 mt-2" />
                    ) : (
                        <p className="font-heading text-2xl font-bold text-foreground mt-1" data-testid="dash-payments-forgiven-count">
                            {count ?? 0}
                        </p>
                    )}
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Monto acumulado</p>
                    {loading ? (
                        <Skeleton className="h-7 w-24 mt-2" />
                    ) : (
                        <p className="font-heading text-2xl font-bold text-foreground mt-1" data-testid="dash-payments-forgiven-amount">
                            {formatMoney(totalAmount ?? 0, currency)}
                        </p>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Pagos condonados en carteras de ciclos activos</p>
            </div>
        </div>
    </>
);
