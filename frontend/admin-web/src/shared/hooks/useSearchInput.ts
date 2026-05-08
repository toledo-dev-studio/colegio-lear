import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Path, UseFormSetValue } from "react-hook-form";

interface Props<T> {
    queryKey: string,
    setValue: UseFormSetValue<Partial<T>>,
    fieldIdKey: Path<Partial<T>>,
    fieldNameKey: Path<Partial<T>>,
    propIdKey: string,
    propNameKey: string
}

export const useSearchInput = <T>(props: Props<T>) => {

    const { queryKey, setValue, fieldIdKey, fieldNameKey, propIdKey, propNameKey } = props;

    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>("");

    const handleOnSearch = (newQuery: string) => {
        queryClient.removeQueries({ queryKey: [queryKey, query] });
        queryClient.setQueryData([queryKey, query], []);
        setQuery(newQuery);
    }

    const handleOnOptionChange = (option: any) => {
        queryClient.setQueryData([queryKey, query], []);
        setValue(fieldIdKey, option[propIdKey] as any);
        setValue(fieldNameKey, option[propNameKey] as any);
    }

    const handleOnClearSelection = () => {
        queryClient.setQueryData([queryKey, query], []);
        setValue(fieldIdKey, undefined as any);
        setValue(fieldNameKey, undefined as any);
        setQuery("");
    }

    return {
        query,
        handleOnSearch,
        handleOnOptionChange,
        handleOnClearSelection
    };
}
