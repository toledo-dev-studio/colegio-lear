import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetAcademicCycleSchoolGroups } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useGetAcademicCycleSchoolGroups";
import { useDeleteAcademicCycleSchoolGroupById } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useDeleteAcademicCycleSchoolGroupById";

export const useAcademicCycleSchoolGroupsTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked, loggedInUserCanWrite } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleSchoolGroupResponse>();

    // Queries
    const getAcademicCycleSchoolGroupQuery = useGetAcademicCycleSchoolGroups({ academicCycleId: academicCycleId! });

    // Mutations
    const deleteAcademicCycleSchoolGroupMutation = useDeleteAcademicCycleSchoolGroupById();

    return {
        context: {
            isLocked,
            academicCycle,
            academicCycleId,
            loggedInUserCanWrite
        },
        queries: {
            schoolGroups: {
                get: getAcademicCycleSchoolGroupQuery
            },
        },
        mutations: {
            schoolGroups: {
                delete: deleteAcademicCycleSchoolGroupMutation,
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
