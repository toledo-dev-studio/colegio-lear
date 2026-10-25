import { useState } from "react";
import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";
import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";
import { useGetStudentGuardiansForStudent } from "@/modules/students/hooks/student-guardians/useGetStudentGuardiansForStudent";
import { useDeleteStudentGuardianByIdForStudent } from "@/modules/students/hooks/student-guardians/useDeleteStudentGuardianByIdForStudent";
import { useCreateUpdateStudentGuardianForStudent } from "@/modules/students/hooks/student-guardians/useCreateUpdateStudentGuardianForStudent";


export const useStudentGuardiansTab = () => {
    // Get context from layout
    const context = useOutletContext<StudentLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const [isOpenStudentGuardianSidePanelForm, setIsOpenStudentGuardianSidePanelForm] = useState<boolean>(false);
    const [studentGuardianFormData, setStudentGuardianFormData] = useState<Partial<StudentGuardianResponse>>({});
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<StudentGuardianResponse>();

    // Queries
    const getStudentGuardiansQuery = useGetStudentGuardiansForStudent({ studentId: context.studentId! });

    // Mutations
    const deleteStudentGuardianMutation = useDeleteStudentGuardianByIdForStudent();
    const createUpdateStudentGuardianMutation = useCreateUpdateStudentGuardianForStudent();

    return {
        context: { ...context },
        queries: {
            guardians: {
                get: getStudentGuardiansQuery
            }
        },
        mutations: {
            guardians: {
                delete: deleteStudentGuardianMutation,
                createUpdate: createUpdateStudentGuardianMutation
            },
        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        studentGuardianSidePanel: {
            data: studentGuardianFormData,
            isOpen: isOpenStudentGuardianSidePanelForm,
            open: (item: Partial<StudentGuardianResponse> = {}) => {
                setStudentGuardianFormData(item);
                setIsOpenStudentGuardianSidePanelForm(true);
            },
            close: () => {
                setStudentGuardianFormData({});
                setIsOpenStudentGuardianSidePanelForm(false);
            }
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
            open: openDeleteModal
        }
    }
}
