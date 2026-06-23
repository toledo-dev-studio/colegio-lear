import { useState } from "react";
import { useSearchParams } from "react-router";
import { Download, Filter, Plus, Search, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface Props {
    enabledAdd?: boolean;
    enabledExport?: boolean;
    enabledAdvancedFilters?: boolean;
    inputSearchPlaceholder?: string;
    inputSearchTooltip?: string;
    handleClickAdvancedFilters?: () => void;
    handleClickExport?: () => void;
    handleClickAdd?: () => void;
}

export const TableRibbon = (props: Props) => {
    const {
        enabledAdd = true,
        enabledExport = true,
        enabledAdvancedFilters = true,
        inputSearchPlaceholder = "",
        inputSearchTooltip = "",
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
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
                <div className="flex flex-col items-center justify-center gap-6 flex-1 md:justify-between md:flex-row">
                    {/* Advanced filters / export actions */}
                    <div className="flex items-center gap-6">
                        {enabledAdvancedFilters && (
                            <Tooltip>
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
                            <Tooltip>
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
                    </div>

                    {/* Search */}
                    <div className="flex-1 w-full">
                        <Tooltip>
                            <TooltipTrigger className="relative w-full md:max-w-md">
                                <div className="relative w-full md:max-w-md">
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
                                        placeholder={inputSearchPlaceholder || "Búsqueda general..."}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p> {inputSearchTooltip || "Búsqueda general"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Add new action */}
                    <div className="flex items-center justify-center gap-6 w-full md:w-fit">
                        {
                            enabledAdd && (
                                <Button onClick={handleClickAdd} className="w-full md:w-fit">
                                    Nuevo registro
                                    <Plus className="ml-4 w-4 h-4" />
                                </Button>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
