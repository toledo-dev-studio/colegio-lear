import { ArrowRight, Loader2, Search } from "lucide-react";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { MODULE_ICON, MODULE_LABELS } from "@/lib/key-value-pairs/key-value-pair-modules";
import type { GlobalSearchRecordResponse, GlobalSearchResponse } from "@/interfaces/responses/global-search.response";

interface Props {
    isLoading: boolean;
    query: string;
    results: GlobalSearchResponse[];
    testid: string;
    onClick: (record: GlobalSearchRecordResponse) => void;
}

export const GlobalSearchResultsList = ({ isLoading, query, results, testid, onClick }: Props) => {
    if (isLoading) {
        return (
            <div className="px-6 py-8 flex items-center justify-center text-sm text-muted-foreground" data-testid={`${testid}-loading`}>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Buscando "{query}"...
            </div>
        );
    }
    if (results.length === 0 && !isLoading) {
        return (
            <div className="px-6 py-10 text-center" data-testid={`${testid}-empty`}>
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-foreground">Sin resultados</p>
                <p className="text-xs text-muted-foreground mt-1">
                    No encontramos coincidencias para <span className="font-mono">"{query}"</span>.
                </p>
            </div>
        );
    }

    return (
        <div className="px-2 py-2" data-testid={`${testid}-results`}>
            {results.map((group) => {
                const meta = MODULE_ICON[group.module];
                const label = labelOf(MODULE_LABELS, group.module);
                return (
                    <div key={group.module} className="mb-2 last:mb-0" data-testid={`${testid}-group-${group.module}`}>
                        <div className="px-4 py-1.5 flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${meta.tone}`}>
                                <meta.Icon className="w-3 h-3" />
                            </span>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                {label}
                            </p>
                            <span className="text-[10px] text-muted-foreground ml-auto">
                                {group.records.length} resultado(s)
                            </span>
                        </div>
                        <div>
                            {group.records.map((rec) => {
                                return (
                                    <button
                                        key={rec.id}
                                        data-testid={`${testid}-result-${rec.id}`}
                                        className="cursor-pointer w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40 hover:opacity-100 hover:text-primary rounded-md"
                                        onClick={() => onClick(rec)}>
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.tone}`}>
                                            <meta.Icon className="w-3.5 h-3.5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                <HighlightMatch text={rec.label} query={query} />
                                            </p>
                                            {rec.subtitle && (
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {rec.subtitle}
                                                </p>
                                            )}
                                        </div>
                                        <ArrowRight className={`w-4 h-4 shrink-0 transition-opacity`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    const q = query.trim();
    if (!q) return <>{text}</>;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-primary/20 text-foreground rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
            {text.slice(idx + q.length)}
        </>
    );
}
