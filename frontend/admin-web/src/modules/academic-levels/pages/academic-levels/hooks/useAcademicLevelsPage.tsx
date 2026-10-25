import { useState } from "react"

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import { useGetAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useGetAcademicLevels";
import { useDeleteAcademicLevelById } from "@/modules/academic-levels/hooks/academic-levels/useDeleteAcademicLevel";
import { useGetPagedAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useGetPagedAcademicLevels";

export const useAcademicLevelsPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicLevelResponse>();

    // Queries
    const pagedAcademicLevelsQuery = useGetPagedAcademicLevels();

    // Mutations
    const deleteAcademicLevelMutation = useDeleteAcademicLevelById();
    const exportAcademicLevelsMutation = useGetAcademicLevels();

    return {
        loader: {
            show: showLoading,
            hide: hideLoading
        },
        advancedFilters: {
            isOpen: isOpenAdvancedFiltersPanel,
            open: () => setIsOpenAdvancedFiltersPanel(true),
            close: () => setIsOpenAdvancedFiltersPanel(false),
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
            open: openDeleteModal
        },
        queries: {
            academicLevels: {
                paged: pagedAcademicLevelsQuery
            }
        },
        mutations: {
            academicLevels: {
                export: exportAcademicLevelsMutation,
                delete: deleteAcademicLevelMutation
            }
        }
    }
}
