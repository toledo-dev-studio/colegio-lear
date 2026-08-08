interface Props {
    label?: string;
    value?: string;
    hint?: string;
    icon: React.ComponentType<{ className?: string }>;
}

export const OverviewCard = ({ label, value, hint, icon: Icon }: Props) => {
    return (
        <>
            <section className="flex items-center gap-3">
                <section className="w-9 h-9 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                </section>
                <section className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
                </section>
            </section>
        </>
    )
}