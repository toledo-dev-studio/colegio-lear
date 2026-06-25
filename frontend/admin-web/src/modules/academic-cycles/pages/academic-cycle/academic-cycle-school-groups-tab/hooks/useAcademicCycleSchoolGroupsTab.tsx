import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import { useGetTeachersEmployees } from "@/modules/employees/hooks/employees/useGetTeachersEmployees";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetSchoolGroupsForAcademicCycle } from "@/modules/academic-cycles/hooks/school-groups/useGetSchoolGroupsForAcademicCycle";
// import { useGetSchoolSubjectsForAcademicCycle } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useGetSchoolSubjectsForAcademicCycle";
import { useDeleteSchoolGroupByIdForAcademicCycle } from "@/modules/academic-cycles/hooks/school-groups/useDeleteSchoolGroupByIdForAcademicCycle";
import { useCreateUpdateSchoolGroupForAcademicCycle } from "@/modules/academic-cycles/hooks/school-groups/useCreateUpdateSchoolGroupForAcademicCycle";

export const useAcademicCycleSchoolGroupsTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleSchoolGroup>();

    // Queries
    const schoolGroupsForAcademicCycleQuery = useGetSchoolGroupsForAcademicCycle(academicCycleId!);

    // Mutations
    const deleteSchoolGroupByIdForAcademicCycle = useDeleteSchoolGroupByIdForAcademicCycle();
    const createUpdateSchoolGroupForAcademicCycle = useCreateUpdateSchoolGroupForAcademicCycle();

    // Related entities queries data
    // const schoolSubjects = useGetSchoolSubjectsForAcademicCycle(academicCycleId!).data.map((item) => { return { id: item.schoolSubjectId, ...item.schoolSubject } as SchoolSubject }) ?? [];
    const schoolSubjects: any = []
    const teachers = useGetTeachersEmployees().data ?? [];

    return {
        context: {
            isLocked,
            academicCycle,
            academicCycleId,
        },
        queries: {
            schoolGroups: {
                data: schoolGroupsForAcademicCycleQuery.data ?? [],
                isError: schoolGroupsForAcademicCycleQuery.isError,
                isLoading: schoolGroupsForAcademicCycleQuery.isLoading,
                isFetching: schoolGroupsForAcademicCycleQuery.isFetching,
            },
            teachers: {
                data: teachers
            },
            schoolSubjects: {
                data: schoolSubjects
            },
        },
        mutations: {
            schoolGroups: {
                delete: deleteSchoolGroupByIdForAcademicCycle,
                createUpdate: createUpdateSchoolGroupForAcademicCycle,
            }
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
