import { GlobalSearchResultsList } from "./GlobalSearchResultsList";
import type { GlobalSearchRecordResponse, GlobalSearchResponse } from "@/interfaces/responses/global-search.response";

interface Props {
    isLoading: boolean;
    isError: boolean;
    query: string;
    results: GlobalSearchResponse[];
    testid: string;
    onClick: (record: GlobalSearchRecordResponse) => void;
}

export const GlobalSearchResultsDropdown = (props: Props) => {
    return (
        <>
            <div
                className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-40 animate-fade-in"
                data-testid={`${props.testid}-dropdown`}>
                <div className="max-h-[70vh] overflow-y-auto">
                    <GlobalSearchResultsList {...props} />
                </div>
                <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-end text-[10px] text-muted-foreground">
                    <span className="font-mono">Colegio LEAR · Búsqueda global</span>
                </div>
            </div>
        </>
    )
}
