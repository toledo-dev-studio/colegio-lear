import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

interface Options {
    handleClickDelete: (item: SchoolSubjectResponse) => void;
}

export const useSchoolSubjectsPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("school-subjects", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre",
        "Descripción",
        "Nivel Académico",
        "Grado Educativo",
        "¿Registro activo?",
        "Acciones",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<SchoolSubjectResponse>[] = [
        {
            key: "name",
            render: ({ id, name }: SchoolSubjectResponse) => (
                <Link to={`/school-subjects/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                </Link>
            )
        },
        { key: "description" },
        {
            key: "academicLevelId",
            render: ({ academicLevelId, academicLevel }: SchoolSubjectResponse) => (
                <Link to={`/academic-levels/${academicLevelId}`}>
                    <span className="text-primary">
                        {academicLevel?.name ?? "-"}
                    </span>
                </Link>
            )
        },
        {
            key: "educationLevel",
            render: ({ academicLevelId, educationLevel }: SchoolSubjectResponse) => (
                <Link to={`/academic-levels/${academicLevelId}`}>
                    <span className="text-primary">
                        {educationLevel?.name ?? "-"}
                    </span>
                </Link>
            )
        },
        {
            key: "isActive",
            render: ({ isActive }: SchoolSubjectResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<SchoolSubjectResponse>[] = [
        {
            key: "edit",
            render: ({ id }: SchoolSubjectResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/school-subjects/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar materia escolar</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: SchoolSubjectResponse) => (
                canDelete &&
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar materia escolar</p>
                    </TooltipContent>
                </Tooltip>
            )
        }
    ];

    return {
        columns,
        properties,
        actions
    }
}
