import { useEffect, useRef } from "react";
import { Search, XCircle } from "lucide-react"

import { cn } from "@/lib/extensions/utils";
import { Input } from "../ui/input"
import { CustomSpinner } from "./CustomSpinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface Props {
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

export const CustomSearchInput = (props: Props) => {
    const {
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

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = defaultValue ?? "";
        }
    }, [defaultValue])

    return (
        <>
            <div className="relative">
                <div className="relative">
                    <Input
                        data-testid="login-password-input"
                        type="text"
                        ref={inputRef}
                        defaultValue={defaultValue}
                        placeholder={placeholder}
                        disabled={disabled || selected || isSearching}
                        onKeyDown={(event) => {
                            if (event.key !== "Enter")
                                return;
                            if (isSearching)
                                return;
                            onSearch(inputRef.current?.value ?? "", event);
                        }}
                        className={
                            cn("pill-input w-full pl-8 pr-12", disabled && "cursor-not-allowed")
                        }
                    />
                    {
                        (!isSearching && !selected) && <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    }
                    {
                        isSearching && <CustomSpinner className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" variant="foreground" />
                    }
                    {
                        selected && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <XCircle className="cursor-pointer w-4 h-4 text-muted-foreground" onClick={onClearSelection} />
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
    )
}
