import React from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, Eye } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatPercentage } from "@/lib/extensions/formatters";

interface Props {
    value?: number;
    loading?: boolean;
}

export const AnnouncementsViewedPercentageCard: React.FC<Props> = ({ value, loading }) => {
    // Component hooks & stores
    const navigate = useNavigate();
    const pct = Math.min(100, Math.max(0, value ?? 0));

    return (
        <div
            className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4"
            data-testid="dash-announcements-viewed"
        >
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-600">
                    <Eye className="w-5 h-5" />
                </div>
                <ArrowUpRight className={cn("w-4 h-4 text-muted-foreground cursor-pointer")} onClick={() => navigate("/announcements")} />
            </div>
            <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Usuarios que vieron las campañas activas</p>
                {loading ? (
                    <>
                        <Skeleton className="h-8 w-24 mt-2" />
                        <Skeleton className="h-2 w-full mt-3 rounded-full" />
                    </>
                ) : (
                    <>
                        <p
                            className="font-heading text-3xl font-bold text-foreground mt-1"
                            data-testid="dash-announcements-viewed-value"
                        >
                            {formatPercentage(pct)}
                        </p>
                        <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-sky-500 transition-all duration-500 ease-out"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
