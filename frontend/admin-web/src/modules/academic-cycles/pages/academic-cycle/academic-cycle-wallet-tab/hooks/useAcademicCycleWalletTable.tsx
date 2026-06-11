import { Link, useOutletContext } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { formatFriendlyDate, formatMoney } from "@/lib/extensions/formatters";

export const useAcademicCycleWalletTable = (
    handleEdit: (item: AcademicCycleWallet) => void,
    handleDelete: (item: AcademicCycleWallet) => void,
) => {
    // Get context from layout
    const { isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Concepto de pago",
        "Monto de pago (MXN)",
        "¿Condonación de pago permitida?",
        "Fecha de vencimiento",
        "Acciones"
    ];
    isLocked && columns.pop();

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleWallet>[] = [
        {
            key: "paymentConcept.name",
            render: (item: AcademicCycleWallet) => (
                <Link to={`/payment-concepts/${item.paymentConceptId}`}>
                    <span className="text-primary">
                        {item.paymentConcept?.name ?? "-"}
                    </span>
                </Link>
            )
        },
        {
            key: "amount",
            render: (item) => (<>{formatMoney(item.amount)}</>)
        },
        {
            key: "allowForgiveness",
            render: (item) => (
                <Badge variant={item.allowForgiveness ? "success" : "destructive"} className="py-4 px-6">
                    {
                        item.allowForgiveness ? "Permitido" : "No permitido"
                    }
                </Badge>
            )
        },
        {
            key: "dueDate",
            render: (item) => (<>{formatFriendlyDate(item.dueDate)}</>)
        },
    ];

    // Table actions column with on click handler
    const actions: TableAction<AcademicCycleWallet>[] = isLocked ? [] : [
        {
            key: "edit",
            render: (item: AcademicCycleWallet) => (
                <Button
                    aria-label="Editar"
                    className="icon-btn-sm bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycleWallet) => (
                <Button
                    aria-label="Eliminar"
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
