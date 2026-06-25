import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetAcademicCycleSchoolSubjects } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useGetSchoolSubjectsForAcademicCycle";
import { useDeleteAcademicCycleSchoolSubjectById } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useDeleteSchoolSubjectByIdForAcademicCycle";
import { useCreateUpdateAcademicCycleSchoolSubject } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useCreateUpdateSchoolSubjectForAcademicCycle";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

export const useAcademicCycleSchoolSubjectsTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleSchoolSubjectResponse>();

    // Queries
    const getAcademicCycleSchoolSubjectsQuery = useGetAcademicCycleSchoolSubjects({ academicCycleId: academicCycleId! });

    // Mutations
    const deleteAcademicCycleSchoolSubjectMutation = useDeleteAcademicCycleSchoolSubjectById();
    const useCreateUpdateAcademicCycleSchoolSubjectMutation = useCreateUpdateAcademicCycleSchoolSubject();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
            schoolSubject: {
                get: getAcademicCycleSchoolSubjectsQuery,
            }
        },
        mutations: {
            schoolSubject: {
                delete: deleteAcademicCycleSchoolSubjectMutation,
                createUpdate: useCreateUpdateAcademicCycleSchoolSubjectMutation,
            },
        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
            open: openDeleteModal
        }
    }
}
