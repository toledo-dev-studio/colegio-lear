import { useState } from "react";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import { useGetJobTitles } from "@/modules/job-titles/hooks/useGetJobTitles";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import { useGetPagedJobTitles } from "@/modules/job-titles/hooks/useGetPagedJobTitles";
import { useDeleteJobTitleById } from "@/modules/job-titles/hooks/useDeleteJobTitleById";

export const useJobTitlesPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<JobTitleResponse>();

    // Queries
    const pagedJobTitlesQuery = useGetPagedJobTitles();

    // Mutations
    const exportJobTitlesMutation = useGetJobTitles();
    const deleteJobTitleMutation = useDeleteJobTitleById();

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
            jobTitles: {
                paged: pagedJobTitlesQuery
            }
        },
        mutations: {
            jobTitles: {
                export: exportJobTitlesMutation,
                delete: deleteJobTitleMutation
            }
        }
    }
}
