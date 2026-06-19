import { useState } from "react";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import { useGetSchoolSubjects } from "@/modules/school-subjects/hooks/useGetSchoolSubjects";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { useGetPagedSchoolSubjects } from "@/modules/school-subjects/hooks/useGetPagedSchoolSubjects";
import { useDeleteSchoolSubjectById } from "@/modules/school-subjects/hooks/useDeleteSchoolSubjectById";

export const useSchoolSubjectsPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<SchoolSubjectResponse>();

    // Queries
    const pagedSchoolSubjectsQuery = useGetPagedSchoolSubjects();

    // Mutations
    const exportSchoolSubjectsMutation = useGetSchoolSubjects();
    const deleteSchoolSubjectMutation = useDeleteSchoolSubjectById();

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
            schoolSubjects: {
                paged: pagedSchoolSubjectsQuery
            }
        },
        mutations: {
            schoolSubjects: {
                export: exportSchoolSubjectsMutation,
                delete: deleteSchoolSubjectMutation
            }
        }
    }
}
