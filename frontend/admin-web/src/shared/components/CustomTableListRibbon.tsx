import { useRef } from "react";
import { useSearchParams } from "react-router";
import { Download, Filter, Plus, Search } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface Props {
    disabledAdvancedFilters?: boolean;
    disabledExport?: boolean;
    disabledAdd?: boolean;
    handleClickAdvancedFilters?: () => void;
    handleClickExport?: () => void;
    handleClickAdd?: () => void;
}

export const CustomTableListRibbon = (props: Props) => {
    const {
        disabledAdvancedFilters = false,
        disabledExport = false,
        disabledAdd = false,
        handleClickAdvancedFilters = () => { },
        handleClickExport = () => { },
        handleClickAdd = () => { },
    } = props;

    const [searchParams, setSearchParams] = useSearchParams();

    const inputSearchRef = useRef<HTMLInputElement>(null);
    const query = searchParams.get('query') || '';

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter')
            return;

        const newSearchParams = new URLSearchParams();
        const query = inputSearchRef.current?.value || '';

        if (!query) {
            newSearchParams.delete('query');
        } else {
            newSearchParams.set('query', query);
        }

        setSearchParams(newSearchParams);
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
                <div className="flex items-center gap-6 flex-1">
                    {/* Filters */}

                    <Button
                        onClick={handleClickAdvancedFilters}
                        variant={"outline"}
                        disabled={disabledAdvancedFilters}
                        className="icon-btn icon-btn-ribbon bg-card hover:bg-card"
                        aria-label="Abrir filtros avanzados">
                        <Filter className="text-primary w-4 h-4" />
                    </Button>

                    {/* Export */}
                    <Button
                        onClick={handleClickExport}
                        variant={"outline"}
                        disabled={disabledExport}
                        className="icon-btn icon-btn-ribbon bg-card hover:bg-card"
                        aria-label="Exportar CSV">
                        <Download className="text-primary w-4 h-4" />
                    </Button>


                    {/* Search */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            ref={inputSearchRef}
                            onKeyDown={handleKeyDown}
                            placeholder="Búsqueda general..."
                            className="pill-input w-full pl-12"
                            defaultValue={query}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Bulk Delete */}

                    {/* 
                    <button
                        // disabled={selected.length === 0}
                        onClick={handleClickBulkDelete}
                        className={cn("icon-btn icon-btn-ribbon transition-all",
                            // KEEP: `${selected.length ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"}`
                        )}
                        aria-label="Eliminar elementos seleccionados">
                        <Trash2 className="w-4 h-4" />
                    </button> 
                    */}


                    {/* Add Button */}
                    <Button
                        onClick={handleClickAdd}
                        disabled={disabledAdd}
                        aria-label="Agregar nuevo registro"
                        className="pill-btn-primary w-fit px-10 rounded-full">
                        Agregar nuevo
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </>
    )
}
