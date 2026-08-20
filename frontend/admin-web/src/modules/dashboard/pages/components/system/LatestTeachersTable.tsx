import React from "react";
import { UserIcon, Users } from "lucide-react";

import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import type { TeacherEmployeeSummaryResponse } from "@/interfaces/responses/dashboard.response";
import { Link } from "react-router";

interface Props {
    data?: TeacherEmployeeSummaryResponse[];
    loading?: boolean;
}

export const LatestTeachersTable: React.FC<Props> = ({ data, loading }) => (
    <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm" data-testid="dash-employees-latest-teachers">
        <div className="flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-lg">Últimos docentes registrados</h3>
        </div>
        {loading ? (
            <ul className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="py-3 flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                            <Skeleton className="h-4 w-3/4 max-w-48" />
                            <Skeleton className="h-3 w-1/2 max-w-32" />
                        </div>
                        <Skeleton className="h-4 w-20 hidden sm:block" />
                    </li>
                ))}
            </ul>
        ) : (
            <ul className="divide-y divide-border">
                {(data ?? []).map((t) => (
                    <li key={t.id}>
                        <Link to={`/employees/${t.id}`} className="py-3 flex items-center gap-4">
                            {
                                t.avatar ?
                                    (
                                        <>
                                            <img className="ml-2 w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                                                alt={t.fullName}
                                                src={t.avatar} />
                                        </>
                                    ) :
                                    (
                                        <div className="ml-2 w-10 h-10 rounded-full bg-muted ring-2 ring-primary/15 flex items-center justify-center overflow-hidden">
                                            <UserIcon className="w-5 h-5 text-muted-foreground/60" />
                                        </div>
                                    )
                            }
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{t.fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">{t.email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">Ingreso: {formatFriendlyDate(t.createdAt)}</span>
                        </Link>
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
