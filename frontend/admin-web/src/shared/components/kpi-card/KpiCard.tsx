import React from "react";
import { ArrowUpRight } from "lucide-react";

import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/lib/extensions/utils";

export type KpiTone = "primary" | "emerald" | "amber" | "rose" | "violet" | "sky";

const toneClasses: Record<KpiTone, string> = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
    violet: "bg-violet-500/10 text-violet-600",
    sky: "bg-sky-500/10 text-sky-600",
};

interface Props {
    label: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
    hint?: string;
    tone?: KpiTone;
    loading?: boolean;
    testid?: string;
    className?: string;
    onArrowUpClick?: () => void;
}

export const KpiCard: React.FC<Props> = ({
    label,
    value,
    icon: Icon,
    hint,
    tone = "primary",
    loading = false,
    testid,
    className,
    onArrowUpClick
}) => (
    <div className={cn("bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col gap-4", className)} data-testid={testid}>
        <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${toneClasses[tone]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <ArrowUpRight onClick={onArrowUpClick && onArrowUpClick} className={cn("w-4 h-4 text-muted-foreground", onArrowUpClick && "cursor-pointer")} />
        </div>
        <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            {loading ? (
                <>
                    <Skeleton className="h-8 w-24 mt-2" data-testid={testid ? `${testid}-skeleton-value` : undefined} />
                    <Skeleton className="h-3 w-32 mt-2" />
                </>
            ) : (
                <>
                    <p className="font-heading text-3xl font-bold text-foreground mt-1" data-testid={testid ? `${testid}-value` : undefined}>
                        {value}
                    </p>
                    {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
                </>
            )}
        </div>
    </div>
);
