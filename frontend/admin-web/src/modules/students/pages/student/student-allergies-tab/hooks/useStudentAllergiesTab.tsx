import { useState } from "react";
import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";
import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";
import { useGetAllergiesForStudent } from "@/modules/students/hooks/student-allergies/useGetAllergiesForStudent";
import { useDeleteAllergyByIdForStudent } from "@/modules/students/hooks/student-allergies/useDeleteAllergyByIdForStudent";
import { useCreateUpdateAllergyForStudent } from "@/modules/students/hooks/student-allergies/useCreateUpdateAllergyForStudent";


export const useStudentAllergiesTab = () => {
    // Get context from layout
    const context = useOutletContext<StudentLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const [isOpenAllergySideForm, setIsOpenAllergySideForm] = useState<boolean>(false);
    const [allergySideFormData, setAllergySideFormData] = useState<Partial<AllergyResponse>>({});
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AllergyResponse>();

    // Queries
    const getStudentAllergiesQuery = useGetAllergiesForStudent({ studentId: context.studentId! });

    // Mutations
    const deleteAllergyMutation = useDeleteAllergyByIdForStudent();
    const createUpdateAllergyMutation = useCreateUpdateAllergyForStudent();

    return {
        context: { ...context },
        queries: {
            allergies: {
                get: getStudentAllergiesQuery
            }
        },
        mutations: {
            allergies: {
                delete: deleteAllergyMutation,
                createUpdate: createUpdateAllergyMutation
            },
        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        allergySidePanel: {
            data: allergySideFormData,
            isOpen: isOpenAllergySideForm,
            open: (item: Partial<AllergyResponse> = {}) => {
                setAllergySideFormData(item);
                setIsOpenAllergySideForm(true);
            },
            close: () => {
                setAllergySideFormData({});
                setIsOpenAllergySideForm(false);
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
