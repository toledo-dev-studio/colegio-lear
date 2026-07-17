import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search, X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useGetGlobalSearch } from "../../hooks/useGetGlobalSearch";
import { GlobalSearchResultsDropdown } from "./GlobalSearchResultsDropdown";

export const GlobalSearchInput = () => {
    // Navigation hooks
    const navigate = useNavigate();

    // Element refs
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Components hooks and stores
    const [openDropdown, setOpenDropdown] = useState(false);
    const { query, setQuery, debouncedValue } = useDebounce({ delay: 300, minLength: 5 });
    const { data, isLoading, isError } = useGetGlobalSearch({ query: debouncedValue });

    // Click outside container to close results dropdown
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setOpenDropdown(false);
        };
        if (openDropdown) document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [openDropdown]);

    return (
        <>
            {/* Globar search input */}
            <div className="flex-1 w-full mx-auto" ref={containerRef}>
                {
                    query ?
                        (<X className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                            onClick={() => setQuery("")} />) :
                        (<Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />)
                }
                <Input
                    ref={inputRef}
                    type="text"
                    onFocus={() => setOpenDropdown(true)}
                    placeholder="Búsqueda global..."
                    data-testid="header-search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                {/* Results dropdown */}
                <div className="flex-1 w-full mx-auto z-10">
                    {openDropdown && (query.trim().length >= 5) && (
                        <GlobalSearchResultsDropdown
                            isLoading={isLoading}
                            isError={isError}
                            query={query}
                            results={data}
                            onClick={(record) => {
                                navigate(record.route);
                                setOpenDropdown(false);
                            }}
                            testid={"global-search"}
                        />
                    )}
                </div>
            </div>
        </>
    )
}
