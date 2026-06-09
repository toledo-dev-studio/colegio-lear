import { Pencil, Trash } from "lucide-react";
import { useOutletContext } from "react-router";

import { Button } from "@/shared/ui/button";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, type AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { Badge } from "@/shared/ui/badge";

export const useAcademicCycleSchoolGroupsTable = (handleEdit: (item: AcademicCycleSchoolGroup) => void, handleDelete: (item: AcademicCycleSchoolGroup) => void) => {
    // Get context from layout
    const { isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Grupo escolar",
        "Descripción",
        "Estatus",
        "Acciones"
    ];
    isLocked && columns.pop();

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleSchoolGroup>[] = [
        { key: "name" },
        { key: "description" },
        {
            key: "status",
            render: (item) => (
                <Badge variant={
                    item.status === "discharged" ? "destructive" :
                        item.status === "active" ? "success" : "ghost"
                } className="py-4 px-6">
                    {ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES.find((status) => status.key === item.status)?.label || "Desconocido"}
                </Badge>
            )
        },
    ];

    const actions: TableAction<AcademicCycleSchoolGroup>[] = isLocked ? [] : [
        {
            key: "edit",
            render: (item: AcademicCycleSchoolGroup) => (
                <Button
                    className="icon-btn-sm bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycleSchoolGroup) => (
                <Button
                    className="icon-btn-sm bg-destructive text-primary-foreground hover:bg-destructive/90"
                    onClick={() => handleDelete(item)}>
                    <Trash className="w-4 h-4" />
                </Button>
            )
        }
    ];

    return {
        columns,
        properties,
        actions
    }
}
