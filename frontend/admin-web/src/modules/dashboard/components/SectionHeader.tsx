import React from "react";

interface Props {
    label: string;
    testid?: string;
}

export const SectionHeader: React.FC<Props> = ({ label, testid }) => (
    <div className="flex items-center gap-3 mb-5" data-testid={testid}>
        <h1 className="text-foreground font-semibold text-xl w-full pb-4 uppercase">{label}</h1>

    </div>
);
