import React from "react";

interface Props {
    label: string;
    tone?: "primary" | "emerald" | "amber" | "rose" | "violet" | "sky";
    testid?: string;
}

const barTone: Record<NonNullable<Props["tone"]>, string> = {
    primary: "bg-primary",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    violet: "bg-violet-500",
    sky: "bg-sky-500",
};

export const SectionHeader: React.FC<Props> = ({ label, tone = "primary", testid }) => (
    <div className="flex items-center gap-3 mb-5" data-testid={testid}>
        <span className={`w-1.5 h-6 rounded-full ${barTone[tone]}`} />
        <h2 className="font-heading font-bold text-lg text-foreground tracking-tight">
            {label}
        </h2>
        <span className="flex-1 h-px bg-border ml-2" />
    </div>
);
