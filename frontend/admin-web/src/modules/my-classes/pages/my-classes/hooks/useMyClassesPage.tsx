import { useState } from "react";

import { useGetPagedMyClasses } from "@/modules/my-classes/hooks/my-classes/useGetPagedMyClasses";

export const useMyClassesPage = () => {
    // Hooks & stores
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);

    // Queries
    const pagedMyClassesQuery = useGetPagedMyClasses();

    return {
        advancedFilters: {
            isOpen: isOpenAdvancedFiltersPanel,
            open: () => setIsOpenAdvancedFiltersPanel(true),
            close: () => setIsOpenAdvancedFiltersPanel(false),
        },
        queries: {
            myClasses: {
                paged: pagedMyClassesQuery
            }
        }
    }
}