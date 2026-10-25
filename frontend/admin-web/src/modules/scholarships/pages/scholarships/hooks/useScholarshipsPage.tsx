import { useState } from "react";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import { useGetScholarships } from "@/modules/scholarships/hooks/useGetScholarships";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import { useDeleteScholarshipById } from "@/modules/scholarships/hooks/useDeleteScholarshipById";
import { useGetPagedScholarships } from "@/modules/scholarships/hooks/useGetPagedScholarships";

export const useScholarshipsPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<ScholarshipResponse>();

    // Queries
    const pagedScholarshipsQuery = useGetPagedScholarships();

    // Mutations
    const exportScholarshipsMutation = useGetScholarships();
    const deleteScholarshipMutation = useDeleteScholarshipById();

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
            scholarships: {
                paged: pagedScholarshipsQuery
            }
        },
        mutations: {
            scholarships: {
                export: exportScholarshipsMutation,
                delete: deleteScholarshipMutation
            }
        }
    }
}
