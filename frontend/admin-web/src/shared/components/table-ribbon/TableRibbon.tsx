import { useState } from "react";
import { useSearchParams } from "react-router";
import { Download, Filter, Plus, Search, X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/extensions/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface Props {
    disabledAddButton?: boolean;
    disabledFilterButton?: boolean;
    disabledExportButton?: boolean;
    disabledSearchInput?: boolean;


    enabledAdd?: boolean;
    enabledExport?: boolean;
    enabledAdvancedFilters?: boolean;
    enabledSearch?: boolean;
    inputSearchPlaceholder?: string;
    inputSearchTooltip?: string;
    className?: string;
    handleClickAdvancedFilters?: () => void;
    handleClickExport?: () => void;
    handleClickAdd?: () => void;
}

export const TableRibbon = (props: Props) => {
    const {
        disabledAddButton,
        disabledFilterButton,
        disabledExportButton,
        disabledSearchInput,
        enabledAdd = true,
        enabledExport = true,
        enabledAdvancedFilters = true,
        enabledSearch = true,
        inputSearchPlaceholder = "",
        inputSearchTooltip = "",
        className = "",
        handleClickAdvancedFilters = () => { },
        handleClickExport = () => { },
        handleClickAdd = () => { },
    } = props;

    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState<string>(searchParams.get("query") ?? "");

    const updateQueryParam = (query: string) => {
        const newSearchParams = new URLSearchParams();
        if (!query.length) {
            newSearchParams.delete("query");
        } else {
            newSearchParams.set("query", query);
        }
        setSearchParams(newSearchParams);
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter")
            return;
        updateQueryParam(query);
    }

    return (
        <>
            <section className={cn("flex flex-col gap-6 mb-6 lg:flex-row lg:items-center", className)}>
                {/* Advanced filters / export actions */}
                {enabledAdvancedFilters && (
                    <Tooltip disabled={disabledFilterButton}>
                        <TooltipTrigger>
                            <span className="icon-btn icon-btn-ribbon bg-transparent dark:bg-input/30 border border-input" onClick={handleClickAdvancedFilters}>
                                <Filter className="text-primary w-4 h-4" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Aplicar filtros avanzados</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {enabledExport && (
                    <Tooltip disabled={disabledExportButton}>
                        <TooltipTrigger>
                            <span className="icon-btn icon-btn-ribbon bg-transparent dark:bg-input/30 border border-input" onClick={handleClickExport}>
                                <Download className="text-primary w-4 h-4" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Exportar datos</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Search */}
                {
                    enabledSearch && (
                        <Tooltip>
                            <TooltipTrigger className="relative w-full lg:max-w-md">
                                <div className="relative w-full lg:max-w-md">
                                    {query.length > 0 ?
                                        <X className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:cursor-pointer"
                                            onClick={() => {
                                                setQuery("");
                                                updateQueryParam("");
                                            }} />
                                        : <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                                    <Input
                                        value={query}
                                        onKeyDown={handleKeyDown}
                                        onChange={(e) => setQuery(e.target.value)}
                                        disabled={disabledSearchInput}
                                        className={cn("pr-13", disabledSearchInput && "disabled")}
                                        placeholder={inputSearchPlaceholder || "Búsqueda general..."}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p> {inputSearchTooltip || "Búsqueda general"}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                }

                {/* Add new action */}
                {
                    enabledAdd && (
                        <Button onClick={handleClickAdd}
                            disabled={disabledAddButton}
                            className={cn("w-full lg:w-fit mx-auto lg:ml-auto lg:mr-0", disabledAddButton && "disabled")}>
                            Nuevo registro
                            <Plus className="ml-4 w-4 h-4" />
                        </Button>
                    )
                }
            </section>
        </>
    )
}
