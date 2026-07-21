import React from "react";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";
import type { TopSchoolGroupResponse } from "@/interfaces/responses/dashboard.response";


interface Props {
    data?: TopSchoolGroupResponse[];
    loading?: boolean;
}

const rankColors = [
    "bg-amber-500/15 text-amber-600",
    "bg-slate-400/15 text-slate-600",
    "bg-orange-600/15 text-orange-700",
    "bg-primary/10 text-primary",
    "bg-primary/10 text-primary",
];

export const TopGroupsTable: React.FC<Props> = ({ data, loading }) => {
    return (
        <div
            className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm"
            data-testid="dash-academic-top-groups"
        >
            <div className="flex items-center gap-2 mb-5">
                <Trophy className="w-4 h-4 text-amber-600" />
                <h3 className="font-heading font-bold text-lg">Top 5 grupos con mejor promedio</h3>
            </div>
            {loading ? (
                <ul className="divide-y divide-border">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="py-3 flex items-center gap-4">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                            <Skeleton className="h-6 w-14 rounded-full" />
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="divide-y divide-border">
                    {(data ?? []).map((g, idx) => (
                        <li key={g.id} className="py-3 flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${rankColors[idx] ?? rankColors[3]}`}>
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{g.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {g.academicCycleName} · {g.studentsCount} alumnos
                                </p>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-600">
                                {g.averageGrade.toFixed(1)}
                            </span>
                        </li>
                    ))}
                    {(!data || data.length <= 0) && (
                        <li className="py-3 flex items-center gap-4">
                            <p className="text-center text-sm text-muted-foreground truncate">No se encontraron datos para mostrar</p>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};
