import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { formatMoney } from "@/lib/extensions/formatters";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";
import { usePermission } from "@/modules/auth/hooks/usePermission";

interface Options {
    handleClickDelete: (item: PaymentConceptResponse) => void;
}

export const usePaymentConceptsPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("payment-concepts", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre & descripción",
        "Código",
        "Monto (MXN)",
        "¿Condonación permitida?",
        "¿Registro activo?",
        "Acciones",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<PaymentConceptResponse>[] = [
        {
            key: "name",
            render: ({ id, name, description }: PaymentConceptResponse) => (
                <Link to={`/payment-concepts/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{description}</div>
                </Link>
            )
        },
        {
            key: "code"
        },
        {
            key: "amount",
            render: ({ amount }: PaymentConceptResponse) => (formatMoney(amount))
        },
        {
            key: "allowForgiveness",
            render: ({ allowForgiveness }: PaymentConceptResponse) => (
                <Badge variant={allowForgiveness ? "default" : "destructive"} className="py-4 px-6">
                    {
                        allowForgiveness ? "Permitido" : "No permitido"
                    }
                </Badge>
            )
        },
        {
            key: "isActive",
            render: ({ isActive }: PaymentConceptResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<PaymentConceptResponse>[] = [
        {
            key: "edit",
            render: ({ id }: PaymentConceptResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/payment-concepts/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar concepto de pago</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: PaymentConceptResponse) => (
                canDelete &&
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar concepto de pago</p>
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
