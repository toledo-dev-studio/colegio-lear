import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

export const useAcademicCycleSchoolSubjectTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleSchoolSubject>();

    // Table configuration structure
    const tableColumnsStructure: string[] = [
        "Materia escolar",
        "Descripción de la materia",
        "Observaciones adicionales",
        "Acciones"
    ];
    isLocked && tableColumnsStructure.pop();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
        },
        mutations: {
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
        tableStructure: {
            colums: tableColumnsStructure
        },
    }
}
