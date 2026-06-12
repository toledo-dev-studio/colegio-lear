import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import type { AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";
import { useGetSchoolGroupsForAcademicCycle } from "@/modules/academic-cycles/hooks/school-groups/useGetSchoolGroupsForAcademicCycle";
import { useGetPagedEnrollmentsForAcademicCycle } from "@/modules/academic-cycles/hooks/enrollments/useGetPagedEnrollmentsForAcademicCycle";
import { useDeleteEnrollmentByIdForAcademicCycle } from "@/modules/academic-cycles/hooks/enrollments/useDeleteEnrollmentByIdForAcademicCycle";
import { useCreateUpdateEnrollmentForAcademicCycle } from "@/modules/academic-cycles/hooks/enrollments/useCreateUpdateEnrollmentForAcademicCycle";

export const useAcademicCycleEnrollmentsTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleSchoolGroupEnrollment>();

    // Queries
    const schoolGroupsForAcademicCycleQuery = useGetSchoolGroupsForAcademicCycle(academicCycleId!);
    const pagedEnrollmentForAcademicCycleQuery = useGetPagedEnrollmentsForAcademicCycle({ academicCycleId });

    const deleteEnrollmentByIdForAcademicCycle = useDeleteEnrollmentByIdForAcademicCycle();
    const createUpdateEnrollmentForAcademicCycle = useCreateUpdateEnrollmentForAcademicCycle();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
            enrollments: {
                ...pagedEnrollmentForAcademicCycleQuery.data,
                data: pagedEnrollmentForAcademicCycleQuery.data?.data ?? [],
                isLoading: pagedEnrollmentForAcademicCycleQuery.isLoading,
                isError: pagedEnrollmentForAcademicCycleQuery.isError,
                isFetching: pagedEnrollmentForAcademicCycleQuery.isFetching
            },
            schoolGroups: {
                data: schoolGroupsForAcademicCycleQuery.data ?? [],
                isError: schoolGroupsForAcademicCycleQuery.isError,
                isLoading: schoolGroupsForAcademicCycleQuery.isLoading,
                isFetching: schoolGroupsForAcademicCycleQuery.isFetching,
            },
        },
        mutations: {
            enrollments: {
                delete: deleteEnrollmentByIdForAcademicCycle,
                createUpdate: createUpdateEnrollmentForAcademicCycle,
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
