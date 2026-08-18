import { Link } from "react-router";
import { Badge } from "@/shared/shadcn/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, ACADEMIC_CYCLE_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { MyClassResponse } from "@/interfaces/responses/my-class.response";

export const useMyClassesPageTable = () => {
    // Table columns configuration structure
    const columns: string[] = [
        "Grupo escolar",
        "Ciclo escolar",
        "Estatus del ciclo",
        "Estatus del grupo",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<MyClassResponse>[] = [
        {
            key: "name",
            render: ({ id, name }: MyClassResponse) => (
                <Link to={`/my-classes/${id}`} className="font-medium text-primary hover:underline">
                    {name}
                </Link>
            )
        },
        {
            key: "academicCycle",
            render: ({ academicCycle }: MyClassResponse) => (
                academicCycle ? `${academicCycle.name} (${academicCycle.code})` : "-"
            )
        },
        {
            key: "academicCycleStatus",
            render: ({ academicCycle }: MyClassResponse) => (
                <Badge variant={
                    academicCycle?.status === "active" ? "success" :
                        academicCycle?.status === "upcoming" ? "warning" :
                            academicCycle?.status === "completed" ? "secondary" :
                                academicCycle?.status === "cancelled" ? "destructive" : "ghost"
                } className="py-4 px-6">
                    {labelOf(ACADEMIC_CYCLE_STATUSES, academicCycle?.status) || "Desconocido"}
                </Badge>
            )
        },
        {
            key: "status",
            render: ({ status }: MyClassResponse) => (
                <Badge variant={status === "discharged" ? "destructive" : "success"} className="py-4 px-6">
                    {labelOf(ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, status) || "Desconocido"}
                </Badge>
            )
        }
    ];

    return {
        columns,
        properties
    }
}