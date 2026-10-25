import { useCallback, useSyncExternalStore } from "react";

export const useMediaQuery = (query: string): boolean => {
    const subscribe = useCallback((callback: () => void) => {
        const mediaQuery = window.matchMedia(query);
        mediaQuery.addEventListener("change", callback);
        return () => mediaQuery.removeEventListener("change", callback);
    }, [query]);

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches
    );
};
