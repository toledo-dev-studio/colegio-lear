import { useState } from "react";
import { useSearchParams } from "react-router";
import { Download, Filter, Plus, Search, X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/extensions/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface ButtonProps {
    show?: boolean;
    disabled?: boolean;
    label?: string;
    tooltip?: string;
    handleClick?: () => void;
}

interface SearchInputProps {
    show?: boolean;
    tooltip?: string;
    disabled?: boolean;
    placeholder?: string;
    onClickClear?: () => void,
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>, query: string) => void;
    onChange?: (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => void;
}

interface Props {
    addButton?: ButtonProps;
    filterButton?: ButtonProps;
    exportButton?: ButtonProps;
    searchInput?: SearchInputProps;
    className?: string;
}

export const TableRibbon = (props: Props) => {
    const { className = "" } = props;
    const addButton: ButtonProps = {
        show: true,
        disabled: false,
        label: "Agregar nuevo",
        handleClick: () => { },
        ...props.addButton,
    };
    const filterButton: ButtonProps = {
        show: true,
        disabled: false,
        tooltip: "Aplicar filtros avanzados",
        handleClick: () => { },
        ...props.filterButton,
    };
    const exportButton: ButtonProps = {
        show: true,
        disabled: false,
        tooltip: "Exportar datos",
        handleClick: () => { },
        ...props.exportButton,
    };
    const searchInput: SearchInputProps = {
        show: true,
        disabled: false,
        tooltip: "Búsqueda rápida",
        placeholder: "Búsqueda rápida",
        ...props.searchInput,
    };

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
                {/* Advanced filters */}
                {
                    filterButton.show && (
                        <Tooltip disabled={filterButton.disabled}>
                            <TooltipTrigger>
                                <span onClick={filterButton.handleClick} className="icon-btn icon-btn-ribbon bg-transparent dark:bg-input/30 border border-input">
                                    <Filter className="text-primary w-4 h-4" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{filterButton.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                }

                {/* Export data */}
                {
                    exportButton.show && (
                        <Tooltip disabled={exportButton.disabled}>
                            <TooltipTrigger>
                                <span onClick={exportButton.handleClick} className="icon-btn icon-btn-ribbon bg-transparent dark:bg-input/30 border border-input">
                                    <Download className="text-primary w-4 h-4" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{exportButton.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                {/* Search input */}
                {
                    searchInput.show && (
                        <Tooltip>
                            <TooltipTrigger className="relative w-full lg:max-w-md">
                                <div className="relative w-full lg:max-w-md">
                                    {query.length > 0 ?
                                        <X className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:cursor-pointer"
                                            onClick={() => {
                                                setQuery("");
                                                searchInput?.onClickClear ? searchInput.onClickClear() : updateQueryParam("");
                                            }} />
                                        : <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                                    <Input
                                        value={query}
                                        onKeyDown={(e) => {
                                            searchInput?.onKeyDown ? searchInput.onKeyDown(e, query) : handleKeyDown(e);
                                        }}
                                        onChange={(e) => {
                                            setQuery(e.target.value)
                                            searchInput?.onChange && searchInput.onChange(e);
                                        }}
                                        disabled={searchInput.disabled}
                                        className={cn("pr-13", searchInput.disabled && "disabled")}
                                        placeholder={searchInput.placeholder}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{searchInput.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                }

                {/* Add new */}
                {
                    addButton.show && (
                        <Button onClick={addButton.handleClick}
                            disabled={addButton.disabled}
                            className={cn("w-full lg:w-fit mx-auto lg:ml-auto lg:mr-0", addButton.disabled && "disabled")}>
                            {addButton.label}
                            <Plus className="ml-4 w-4 h-4" />
                        </Button>
                    )
                }
            </section>
        </>
    )
}
