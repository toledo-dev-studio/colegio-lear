import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetSchoolSubjectsForAcademicCycle } from "@/modules/academic-cycles/hooks/school-subjects/useGetSchoolSubjectsForAcademicCycle";
import { useDeleteSchoolSubjectByIdForAcademicCycle } from "@/modules/academic-cycles/hooks/school-subjects/useDeleteSchoolSubjectByIdForAcademicCycle";
import { useCreateUpdateSchoolSubjectForAcademicCycle } from "@/modules/academic-cycles/hooks/school-subjects/useCreateUpdateSchoolSubjectForAcademicCycle";
import { useSearchSchoolSubjects } from "@/modules/school-subjects/hooks/useSearchSchoolSubjects";

export const useAcademicCycleSchoolSubjectTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleSchoolSubject>();
    const schoolSubjectsForAcademicCycleQuery = useGetSchoolSubjectsForAcademicCycle(academicCycleId!);
    const deleteSchoolSubjectByIdForAcademicCycle = useDeleteSchoolSubjectByIdForAcademicCycle();
    const createUpdateSchoolSubjectForAcademicCycle = useCreateUpdateSchoolSubjectForAcademicCycle();
    const searchSchoolSubjects = useSearchSchoolSubjects();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
            schoolSubjectsForAcademicCycleQuery
        },
        mutations: {
            deleteSchoolSubjectByIdForAcademicCycle,
            createUpdateSchoolSubjectForAcademicCycle,
            searchSchoolSubjects
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
