import { useState } from "react";
import { useSearchParams } from "react-router";
import { Download, FunnelPlus, Plus, Search, X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/extensions/utils";

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
            <section className={cn("flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between", className)}>

                {/* Search input */}
                {
                    searchInput.show && (
                        <section className="relative w-full xl:max-w-lg">
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
                        </section>
                    )
                }

                <section className="flex flex-col items-center gap-6 justify-center xl:justify-end lg:flex-row lg:flex-1">
                    {/* Export data */}
                    {
                        exportButton.show && (
                            <Button onClick={exportButton.handleClick}
                                disabled={exportButton.disabled}
                                variant={"outline"}
                                className={cn("w-full lg:w-fit", exportButton.disabled && "disabled")}>
                                {exportButton.label || "Exportar datos"}
                                <Download className="ml-4 w-4 h-4" />
                            </Button>
                        )
                    }

                    {/* Advanced filters */}
                    {
                        filterButton.show && (
                            <Button onClick={filterButton.handleClick}
                                disabled={filterButton.disabled}
                                variant={"outline"}
                                className={cn("w-full lg:w-fit", filterButton.disabled && "disabled")}>
                                {filterButton.label || "Filtros avanzados"}
                                <FunnelPlus className="ml-4 w-4 h-4" />
                            </Button>
                        )
                    }
                    {/* Add new */}
                    {
                        addButton.show && (
                            <Button onClick={addButton.handleClick}
                                disabled={addButton.disabled}
                                className={cn("w-full lg:w-fit", addButton.disabled && "disabled")}>
                                {addButton.label}
                                <Plus className="ml-4 w-4 h-4" />
                            </Button>
                        )
                    }
                </section>
            </section>
        </>
    )
}
