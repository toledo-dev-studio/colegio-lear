import { useState } from 'react'

export const useAdvancedFilters = () => {
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    
    return {
        isOpenAdvancedFiltersPanel,
        openAdvancedFilters: () => setIsOpenAdvancedFiltersPanel(true),
        closeAdvancedFilters: () => setIsOpenAdvancedFiltersPanel(false)
    }
}
