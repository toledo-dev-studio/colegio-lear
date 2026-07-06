import { useOutletContext } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { formatFriendlyDate, formatMoney } from "@/lib/extensions/formatters";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

interface Options {
    handleClickEdit: (item: AcademicCycleWalletItemResponse) => void;
    handleClickDelete: (item: AcademicCycleWalletItemResponse) => void;
}

export const useAcademicCycleWalletTable = ({ handleClickEdit, handleClickDelete }: Options) => {
    // Get context from layout
    const { isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Concepto de pago",
        "Monto de pago (MXN)",
        "¿Condonación de pago permitida?",
        "Fecha de vencimiento",
        "Descripción",
        "Acciones"
    ];
    isLocked && columns.pop();

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleWalletItemResponse>[] = [
        {
            key: "name",
            render: (item: AcademicCycleWalletItemResponse) => (
                <span className="text-primary cursor-pointer" onClick={() => handleClickEdit(item)}>
                    {item.name ?? "-"}
                </span>
            )
        },
        {
            key: "amount",
            render: ({ amount }: AcademicCycleWalletItemResponse) => (formatMoney(amount))
        },
        {
            key: "allowForgiveness",
            render: ({ allowForgiveness }: AcademicCycleWalletItemResponse) => (
                <Badge variant={allowForgiveness ? "success" : "destructive"} className="py-4 px-6">
                    {
                        allowForgiveness ? "Permitido" : "No permitido"
                    }
                </Badge>
            )
        },
        {
            key: "dueDate",
            render: ({ dueDate }: AcademicCycleWalletItemResponse) => (formatFriendlyDate(dueDate))
        },
        { key: "description" }
    ];

    // Table actions list
    const actions: TableAction<AcademicCycleWalletItemResponse>[] = isLocked ? [] : [
        {
            key: "edit",
            render: (item: AcademicCycleWalletItemResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-primary text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickEdit(item)}>
                            <Pencil className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar concepto de la cartera</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycleWalletItemResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar concepto de la cartera</p>
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
