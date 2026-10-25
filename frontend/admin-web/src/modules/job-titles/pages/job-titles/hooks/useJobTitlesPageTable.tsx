import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";

interface Options {
    handleClickDelete: (item: JobTitleResponse) => void;
}

export const useJobTitlesPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("job-titles", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre",
        "Tipo de puesto de trabajo",
        "Descripción",
        "¿Registro activo?",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<JobTitleResponse>[] = [
        {
            key: "name",
            render: ({ id, name }: JobTitleResponse) => (
                <Link to={`/job-titles/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                </Link>
            )
        },
        {
            key: "jobTitleType",
            render: ({ jobTitleType }: JobTitleResponse) => (
                <Badge variant={jobTitleType === "administrative-staff" ? "default" : "success"} className="py-4 px-6">
                    {
                        jobTitleType === "administrative-staff" ? "Administrativo" : "Docente"
                    }
                </Badge>
            )
        },
        { key: "description" },
        {
            key: "isActive",
            render: ({ isActive }: JobTitleResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<JobTitleResponse>[] = [
        {
            key: "edit",
            render: ({ id }: JobTitleResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/job-titles/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar puesto de trabajo</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: JobTitleResponse) => (
                canDelete &&
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar puesto de trabajo</p>
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
