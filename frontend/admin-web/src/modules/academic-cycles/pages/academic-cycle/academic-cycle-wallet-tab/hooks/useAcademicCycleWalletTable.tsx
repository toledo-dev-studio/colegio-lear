import { useOutletContext } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { formatFriendlyDate, formatMoney } from "@/lib/extensions/formatters";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleWalletResponse } from "@/interfaces/responses/academic-cycle-wallet.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

interface Options {
    handleClickEdit: (item: AcademicCycleWalletResponse) => void;
    handleClickDelete: (item: AcademicCycleWalletResponse) => void;
}

export const useAcademicCycleWalletTable = ({ handleClickEdit, handleClickDelete }: Options) => {
    // Get context from layout
    const { isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Concepto de pago",
        "Monto de pago (MXN)",
        "Fecha de vencimiento",
        "¿Condonación de pago permitida?",
        "Descripción",
        "Acciones"
    ];
    isLocked && columns.pop();

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleWalletResponse>[] = [
        {
            key: "name",
            render: (item: AcademicCycleWalletResponse) => (
                <span className="text-primary cursor-pointer" onClick={() => handleClickEdit(item)}>
                    {item.name ?? "-"}
                </span>
            )
        },
        {
            key: "amount",
            render: ({ amount }: AcademicCycleWalletResponse) => (formatMoney(amount))
        },
        {
            key: "allowForgiveness",
            render: ({ allowForgiveness }: AcademicCycleWalletResponse) => (
                <Badge variant={allowForgiveness ? "success" : "destructive"} className="py-4 px-6">
                    {
                        allowForgiveness ? "Permitido" : "No permitido"
                    }
                </Badge>
            )
        },
        {
            key: "dueDate",
            render: ({ dueDate }: AcademicCycleWalletResponse) => (formatFriendlyDate(dueDate))
        },
        { key: "description" }
    ];

    // Table actions list
    const actions: TableAction<AcademicCycleWalletResponse>[] = isLocked ? [] : [
        {
            key: "edit",
            render: (item: AcademicCycleWalletResponse) => (
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
            render: (item: AcademicCycleWalletResponse) => (
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
