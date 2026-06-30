import { useState } from "react";
import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetAcademicCycleSchoolGroups } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useGetAcademicCycleSchoolGroups";
import { useGetPagedAcademicCycleEnrollments } from "@/modules/academic-cycles/hooks/academic-cycle-enrollments/useGetPagedAcademicCycleEnrollments";
import { useDeleteAcademicCycleEnrollmentById } from "@/modules/academic-cycles/hooks/academic-cycle-enrollments/useDeleteEnrollmentByIdForAcademicCycle";
import { useCreateUpdateAcademicCycleEnrollment } from "@/modules/academic-cycles/hooks/academic-cycle-enrollments/useCreateUpdateAcademicCycleEnrollment";

export const useAcademicCycleEnrollmentsTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const [isOpenCreateEnrollmentPanel, setIsOpenCreateEnrollmentPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleEnrollmentResponse>();

    // Queries
    const getAcademicCycleSchoolSubjectsQuery = useGetAcademicCycleSchoolGroups({ academicCycleId: academicCycleId! });
    const getPagedAcademicCycleEnrollmentsQuery = useGetPagedAcademicCycleEnrollments({ academicCycleId: academicCycleId! });

    // Mutations
    const deleteAcademicCycleEnrollmentMutation = useDeleteAcademicCycleEnrollmentById();
    const createUpdateAcademicCycleEnrollmentMutation = useCreateUpdateAcademicCycleEnrollment();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
            enrollments: {
                paged: getPagedAcademicCycleEnrollmentsQuery
            },
            schoolGroups: {
                get: getAcademicCycleSchoolSubjectsQuery
            },
        },
        mutations: {
            enrollments: {
                delete: deleteAcademicCycleEnrollmentMutation,
                createUpdate: createUpdateAcademicCycleEnrollmentMutation,
            },
        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        advancedFiltersPanel: {
            isOpen: isOpenAdvancedFiltersPanel,
            open: () => setIsOpenAdvancedFiltersPanel(true),
            close: () => setIsOpenAdvancedFiltersPanel(false),
        },
        enrollmentPanel: {
            isOpen: isOpenCreateEnrollmentPanel,
            open: () => setIsOpenCreateEnrollmentPanel(true),
            close: () => setIsOpenCreateEnrollmentPanel(false),
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
            open: openDeleteModal
        }
    }
}
