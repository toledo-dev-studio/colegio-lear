import { useEffect, useState } from "react";

interface Options {
    delay?: number;
    minLength?: number;
}

export function useDebounce({ delay = 300, minLength = 5 }: Options) {
    const [query, setQuery] = useState("");
    const [debouncedValue, setDebouncedValue] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            const value = query.trim();
            if (value.length >= minLength) {
                setDebouncedValue(value);
            }
        }, delay);
        return () => clearTimeout(timer);
    }, [query, delay, minLength]);

    return {
        query,
        setQuery,
        debouncedValue
    };
}
