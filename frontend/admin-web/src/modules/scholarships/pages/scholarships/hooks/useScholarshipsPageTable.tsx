import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";

interface Options {
    handleClickDelete: (item: ScholarshipResponse) => void;
}

export const useScholarshipsPageTable = ({ handleClickDelete }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Nombre",
        "Descripción",
        "Descuento (%)",
        "¿Registro activo?",
        "Acciones",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<ScholarshipResponse>[] = [
        {
            key: "name",
            render: ({ id, name }: ScholarshipResponse) => (
                <Link to={`/scholarships/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                </Link>
            )
        },
        { key: "description" },
        {
            key: "discountPercentage",
            render: ({ discountPercentage }: ScholarshipResponse) => (`${discountPercentage} %`)
        },
        {
            key: "isActive",
            render: ({ isActive }: ScholarshipResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<ScholarshipResponse>[] = [
        {
            key: "edit",
            render: ({ id }: ScholarshipResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/scholarships/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar beca escolar</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: ScholarshipResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar beca escolar</p>
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
