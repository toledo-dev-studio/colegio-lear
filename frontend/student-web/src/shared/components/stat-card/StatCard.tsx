interface Props {
    label?: string;
    value?: string;
    accent?: string;
    icon: React.ComponentType<{ className?: string }>;
}

export const StatCard = ({ label, value, accent, icon: Icon }: Props) => {
    return (
        <>
            <section className="bg-card border border-border rounded-xl shadow-sm p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                <section className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${accent}`}>
                    <Icon className="w-5 h-5" />
                </section>
                <section className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
                    <p className="text-lg font-bold text-foreground leading-tight truncate">{value}</p>
                </section>
            </section>
        </>
    );
}