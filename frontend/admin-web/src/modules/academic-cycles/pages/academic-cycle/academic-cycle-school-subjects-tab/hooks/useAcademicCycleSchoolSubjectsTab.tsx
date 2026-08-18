import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetAcademicCycleSchoolSubjects } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useGetAcademicCycleSchoolSubjects";
import { useDeleteAcademicCycleSchoolSubjectById } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useDeleteAcademicCycleSchoolSubjectById";
import { useCreateUpdateAcademicCycleSchoolSubject } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useCreateUpdateAcademicCycleSchoolSubject";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

export const useAcademicCycleSchoolSubjectsTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked, loggedInUserCanWrite } = useOutletContext<AcademicCycleLayoutContext>();

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
            isLocked,
            loggedInUserCanWrite
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
