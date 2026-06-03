import { Pencil, Trash } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import { useAdvancedFilters } from "@/shared/hooks/useAdvancedFilters";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { useExportAcademicCycles } from "@/modules/academic-cycles/hooks/academic-cycles/useExportAcademicCycles";
import { useGetPagedAcademicCycles } from "@/modules/academic-cycles/hooks/academic-cycles/useGetPagedAcademicCycles";
import { useDeleteAcademicCycleById } from "@/modules/academic-cycles/hooks/academic-cycles/useDeleteAcademicCycleById";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES, type AcademicCycle } from "@/interfaces/entites/academic-cycle";

const tableColumnsStructure: string[] = [
    "Nombre & código",
    "Fecha de inicio",
    "Fecha de termino",
    "¿Inscripciones abiertas?",
    "Estatus del ciclo escolar",
    "Tipo de ciclo escolar",
    "Acciones"
];

const tablePropertiesStructure: TableProperty<AcademicCycle>[] = [
    {
        key: "name",
        render: (item) => (
            <Link to={`/academic-cycles/${item.id}`}>
                <span className="text-primary">
                    {item.name}
                </span>
                <div className="text-xs text-muted-foreground truncate max-w-xs">{item.code}</div>
            </Link>
        )
    },
    {
        key: "startDate",
        render: (item) => (<>{formatFriendlyDate(item.startDate)}</>)
    },
    {
        key: "endDate",
        render: (item) => (<>{formatFriendlyDate(item.endDate)}</>)
    },
    {
        key: "enrollmentOpen",
        render: (item) => (
            <Badge variant={item.enrollmentOpen ? "default" : "destructive"} className="py-4 px-6">
                {
                    item.enrollmentOpen ? "Abiertas" : "Cerradas"
                }
            </Badge>
        )
    },
    {
        key: "status",
        render: (item) => (
            <Badge variant={
                item.status === "cancelled" ? "destructive" : 
                item.status === "active" ? "success" :
                item.status === "completed" ? "outline" : 
                item.status === "upcoming" ? "default" : "ghost"} className="py-4 px-6">
                {ACADEMIC_CYCLE_STATUSES.find((status) => status.key === item.status)?.label || "Desconocido"}
            </Badge>
        )
    },
    {
        key: "type",
        render: (item) => (
            <span className="text-nowrap min-w-fit rounded-full bg-gray-400/20 px-4 py-2 text-xs font-medium text-gray-500 inset-ring inset-ring-gray-400/40 dark:text-gray-300">
                {ACADEMIC_CYCLE_PERIOD_TYPES.find((type) => type.key === item.type)?.label || "Desconocido"}
            </span>
        )
    }
];

export const useAcademicCyclesPage = () => {
    // Main hooks & stores
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoaderStore();
    const { isOpenAdvancedFiltersPanel, openAdvancedFilters, closeAdvancedFilters } = useAdvancedFilters();
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycle>();

    // Academic cycles hooks
    const pagedAcademicCyclesQuery = useGetPagedAcademicCycles();
    const exportAcademicCyclesMutation = useExportAcademicCycles();
    const deleteAcademicCycleMutation = useDeleteAcademicCycleById();
    const tableActionsStructure: TableAction<AcademicCycle>[] = [
        {
            key: "edit",
            render: (item: AcademicCycle) => (
                <Button
                    aria-label="Editar"
                    className="icon-btn-sm bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate(`/academic-cycles/${item.id}`)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycle) => (
                <Button
                    aria-label="Eliminar"
                    className="icon-btn-sm bg-destructive text-primary-foreground hover:bg-destructive/90"
                    onClick={() => openDeleteModal(item)}>
                    <Trash className="w-4 h-4" />
                </Button>
            )
        }
    ];

    return {
        queries: {
            pagedAcademicCyclesQuery,
        },
        mutations: {
            exportAcademicCyclesMutation,
            deleteAcademicCycleMutation,
        },
        loader: {
            showLoading,
            hideLoading,
        },
        advancedFilters: {
            isOpen: isOpenAdvancedFiltersPanel,
            open: openAdvancedFilters,
            close: closeAdvancedFilters
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            open: openDeleteModal,
            close: closeDeleteModal
        },
        tableStructure: {
            columns: tableColumnsStructure,
            properties: tablePropertiesStructure,
            actions: tableActionsStructure
        },
        navigate,
    }
}
