import { cn } from "@/lib/extensions/utils";

export type CardHeaderTone = "primary" | "emerald" | "amber" | "rose" | "violet" | "sky";

const toneClasses: Record<CardHeaderTone, string> = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
    violet: "bg-violet-500/10 text-violet-600",
    sky: "bg-sky-500/10 text-sky-600",
};

interface Props {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    tone?: CardHeaderTone;
    className?: string;
}

export const CardHeader = ({ icon: Icon, title, description, tone = "primary", className }: Props) => {
    return (
        <>
            <header className={cn("flex items-center gap-3 pb-3 border-b border-border", className)}>
                <div className={`w-10 h-10 rounded-full ${toneClasses[tone]} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-heading font-bold text-foreground mb-1 truncate">{title}</p>
                    {
                        description && (
                            <p className="text-[11px] text-muted-foreground">{description}</p>
                        )
                    }
                </div>
            </header>
        </>
    );
}