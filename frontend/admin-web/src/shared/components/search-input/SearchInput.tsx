import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "../../shadcn/ui/input";
import { cn } from "@/lib/extensions/utils";
import { Spinner } from "../spinner/Spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn/ui/tooltip";

interface Props {
    name?: string;
    placeholder?: string;
    defaultValue?: string;
    disabled?: boolean;
    selected?: boolean;
    isSearching: boolean;
    options: any[];
    keySchemaName?: string;
    labelSchemaName?: string;
    onClearSelection: () => void;
    onOptionChange: (option: any) => void;
    onSearch: (query: string, event?: React.KeyboardEvent<HTMLInputElement>) => void;
}

export interface SearchInputRef {
    focus: () => void;
}

export const SearchInput = forwardRef<SearchInputRef, Props>((props, ref) => {

    const [searched, setSearched] = useState<boolean>(false);
    const {
        name,
        placeholder,
        defaultValue,
        disabled,
        isSearching,
        selected,
        options = [],
        keySchemaName = "id",
        labelSchemaName = "name",
        onClearSelection,
        onOptionChange,
        onSearch
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState<string>(defaultValue ?? "");

    useImperativeHandle(ref, () => ({
        focus() {
            inputRef.current?.focus();
        }
    }));

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = defaultValue ?? "";
        }
    }, [defaultValue]);

    return (
        <>
            <div className="relative">
                <div className="relative">
                    <Input
                        name={name}
                        data-testid="login-password-input"
                        type="text"
                        ref={inputRef}
                        placeholder={placeholder}
                        disabled={disabled || selected || isSearching}
                        defaultValue={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(event) => {
                            setSearched(false);
                            if (event.key !== "Enter")
                                return;
                            if (isSearching)
                                return;
                            if (event.key === "Enter")
                                event.preventDefault();
                            onSearch(inputRef.current?.value ?? "", event);
                            setQuery(inputRef.current?.value ?? "");
                            setSearched(true);
                        }}
                        className={
                            cn("pill-input w-full pl-8 pr-12", disabled && "cursor-not-allowed")
                        }
                    />
                    {
                        (!isSearching && !selected && !query.length) && <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    }
                    {
                        isSearching && <Spinner className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" variant="foreground" />
                    }
                    {
                        ((selected || query) && !isSearching) && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <X className="cursor-pointer w-4 h-4 text-muted-foreground" onClick={() => {
                                            if (disabled)
                                                return;
                                            setQuery("");
                                            setSearched(false);
                                            onClearSelection();                                            
                                        }} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Remover selección</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )
                    }
                </div>
                {
                    isSearching && (
                        <div className="absolute z-10 w-full text-right mt-2">
                            <ul className="shadow-sm bg-card border border-border text-foreground flex flex-col rounded-md">
                                <li className={cn("py-3 text-sm text-left pl-6 border-b border-border cursor-pointer hover:bg-muted")}>
                                    Cargando...
                                </li>
                            </ul>
                        </div>
                    )
                }

                {
                    (!selected && !isSearching && searched && options.length === 0) && (
                        <div className="absolute z-10 w-full text-right mt-2">
                            <ul className="shadow-sm bg-card border border-border text-foreground flex flex-col rounded-md">
                                <li className={cn("py-3 text-sm text-left pl-6 border-b border-border cursor-pointer hover:bg-muted")}>
                                    No se encontró ningún registro
                                </li>

                            </ul>
                        </div>
                    )
                }

                {
                    (options.length > 0) && (
                        <div className="absolute z-10 w-full text-right mt-2">
                            <ul className="shadow-sm bg-card border border-border text-foreground flex flex-col rounded-md">
                                {
                                    options.map((option) => (
                                        <li key={option[keySchemaName]}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                if (inputRef.current) {
                                                    inputRef.current.value = option[labelSchemaName];
                                                }
                                                onOptionChange(option);
                                                setSearched(false);
                                            }}
                                            className={cn("py-3 text-sm text-left pl-6 border-b border-border cursor-pointer hover:bg-muted")}>
                                            {option[labelSchemaName]}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    )
                }
            </div>
        </>
    );
}
);

SearchInput.displayName = "SearchInput";