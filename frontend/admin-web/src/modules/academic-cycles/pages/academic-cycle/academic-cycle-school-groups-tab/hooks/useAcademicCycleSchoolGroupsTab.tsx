import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetSchoolGroupsForAcademicCycle } from "@/modules/academic-cycles/hooks/school-groups/useGetSchoolGroupsForAcademicCycle";
import { useDeleteSchoolGroupByIdForAcademicCycle } from "@/modules/academic-cycles/hooks/school-groups/useDeleteSchoolGroupByIdForAcademicCycle";
import { useCreateUpdateSchoolGroupForAcademicCycle } from "@/modules/academic-cycles/hooks/school-groups/useCreateUpdateSchoolGroupForAcademicCycle";
import { useGetSchoolSubjectsForAcademicCycle } from "@/modules/academic-cycles/hooks/school-subjects/useGetSchoolSubjectsForAcademicCycle";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { useGetTeachersEmployees } from "@/modules/employees/hooks/employees/useGetTeachersEmployees";

export const useAcademicCycleSchoolGroupsTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleSchoolGroup>();
    const schoolGroupsForAcademicCycleQuery = useGetSchoolGroupsForAcademicCycle(academicCycleId!);
    const deleteSchoolGroupByIdForAcademicCycle = useDeleteSchoolGroupByIdForAcademicCycle();
    const createUpdateSchoolGroupForAcademicCycle = useCreateUpdateSchoolGroupForAcademicCycle();

    // Related entities queries
    const schoolSubjectsForAcademicCycleQuery = useGetSchoolSubjectsForAcademicCycle(academicCycleId!);
    const schoolSubjects = schoolSubjectsForAcademicCycleQuery.data.map((item) => {
        return { id: item.schoolSubjectId, ...item.schoolSubject } as SchoolSubject;
    });
    const teachersEmployeesQuery = useGetTeachersEmployees();
    const teachers = teachersEmployeesQuery.data;

    return {
        context: {
            academicCycleId,
            academicCycle,
            schoolSubjects,
            teachers,
            isLocked
        },
        queries: {
            schoolGroupsForAcademicCycleQuery
        },
        mutations: {
            deleteSchoolGroupByIdForAcademicCycle,
            createUpdateSchoolGroupForAcademicCycle,
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
        },
    }
}
