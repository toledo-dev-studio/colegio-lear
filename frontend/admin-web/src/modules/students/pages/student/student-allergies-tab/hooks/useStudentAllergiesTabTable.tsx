import { Pencil, Trash } from "lucide-react";

import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";
import { ALLERGY_SEVERITIES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";

interface Options {
    handleClickEdit: (item: AllergyResponse) => void;
    handleClickDelete: (item: AllergyResponse) => void;
}

export const useStudentAllergiesTabTable = ({ handleClickEdit, handleClickDelete }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Alérgico a",
        "Severidad",
        "Observaciones",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AllergyResponse>[] = [
        {
            key: "name",
            render: (item: AllergyResponse) => (
                <span className="text-primary cursor-pointer" onClick={() => handleClickEdit(item)}>
                    {item.name ?? "-"}
                </span>
            )
        },
        {
            key: "severity",
            render: ({ severity }: AllergyResponse) => (labelOf(ALLERGY_SEVERITIES, severity))
        },
        { key: "observations" }
    ];

    // Table actions list
    const actions: TableAction<AllergyResponse>[] = [
        {
            key: "edit",
            render: (item: AllergyResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-primary text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickEdit(item)}>
                            <Pencil className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar alergía</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: AllergyResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar alergía</p>
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
