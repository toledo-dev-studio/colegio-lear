import { useState } from "react";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { StudentResponse } from "@/interfaces/responses/student.response";
import { useGetStudents } from "@/modules/students/hooks/students/useGetStudents";
import { useGetPagedStudents } from "@/modules/students/hooks/students/useGetPagedStudents";
import { useDeleteStudentById } from "@/modules/students/hooks/students/useDeleteStudentById";

export const useStudentsPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<StudentResponse>();

    // Queries
    const pagedStudentsQuery = useGetPagedStudents();

    // Mutations
    const exportStudentsMutation = useGetStudents();
    const deleteStudentMutation = useDeleteStudentById();

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
            students: {
                paged: pagedStudentsQuery
            }
        },
        mutations: {
            students: {
                export: exportStudentsMutation,
                delete: deleteStudentMutation
            }
        }
    }
}
