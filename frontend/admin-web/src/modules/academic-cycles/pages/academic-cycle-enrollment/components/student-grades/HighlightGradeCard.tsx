interface Props {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    grade: number;
    tone: "up" | "down";
}

export const HighlightGradeCard = ({ icon: Icon, label, value, grade, tone }: Props) => {
    const tw = tone === "up" ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10";

    return (
        <>
            <section className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tw}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
                    <p className="text-sm font-semibold truncate">{value}</p>
                </div>
                <span className={`text-base font-mono font-bold ${tone === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                    {grade.toFixed(1)}
                </span>
            </section>
        </>
    );
}
