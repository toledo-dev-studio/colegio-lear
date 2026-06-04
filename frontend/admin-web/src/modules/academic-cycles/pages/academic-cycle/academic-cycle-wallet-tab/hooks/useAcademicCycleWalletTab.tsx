import { Link, useOutletContext } from "react-router";

import { Badge } from "@/shared/ui/badge";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import { formatFriendlyDate, formatMoney } from "@/lib/extensions/formatters";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { useGetWalletForAcademicCycle } from "@/modules/academic-cycles/hooks/wallet/useGetWalletForAcademicCycle";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useDeleteWalletByIdForAcademicCycle } from "@/modules/academic-cycles/hooks/wallet/useDeleteWalletByIdForAcademicCycle";
import { useCreateUpdateWalletForAcademicCycle } from "@/modules/academic-cycles/hooks/wallet/useCreateUpdateWalletForAcademicCycle";

const tablePropertiesStructure: TableProperty<AcademicCycleWallet>[] = [
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

export const useAcademicCycleWalletTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleWallet>();
    const walletForAcademicCycleQuery = useGetWalletForAcademicCycle(academicCycleId!);
    const deleteWalletByIdForAcademicCycle = useDeleteWalletByIdForAcademicCycle();
    const createUpdateWalletForAcademicCycle = useCreateUpdateWalletForAcademicCycle();

    // Table configuration structure
    const tableColumnsStructure: string[] = [
        "Concepto de pago",
        "Monto de pago (MXN)",
        "¿Condonación de pago permitida?",
        "Fecha de vencimiento",
        "Acciones"
    ];
    isLocked && tableColumnsStructure.pop();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
            walletForAcademicCycleQuery
        },
        mutations: {
            deleteWalletByIdForAcademicCycle,
            createUpdateWalletForAcademicCycle
        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
            open: openDeleteModal
        },
        tableStructure: {
            columns: tableColumnsStructure,
            properties: tablePropertiesStructure,
        },
    }
}
