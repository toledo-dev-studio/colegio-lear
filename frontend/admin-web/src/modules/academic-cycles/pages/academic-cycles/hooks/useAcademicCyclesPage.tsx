import { useState } from "react";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import { useGetAcademicCycles } from "@/modules/academic-cycles/hooks/academic-cycles/useGetAcademicCycles";
import { useGetPagedAcademicCycles } from "@/modules/academic-cycles/hooks/academic-cycles/useGetPagedAcademicCycles";
import { useDeleteAcademicCycleById } from "@/modules/academic-cycles/hooks/academic-cycles/useDeleteAcademicCycleById";

export const useAcademicCyclesPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleResponse>();

    // Queries
    const pagedAcademicCyclesQuery = useGetPagedAcademicCycles();

    // Mutations
    const exportAcademicCyclesMutation = useGetAcademicCycles();
    const deleteAcademicCycleMutation = useDeleteAcademicCycleById();

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
            academicCycles: {
                paged: pagedAcademicCyclesQuery
            }
        },
        mutations: {
            academicCycles: {
                export: exportAcademicCyclesMutation,
                delete: deleteAcademicCycleMutation
            }
        }
    }
}
