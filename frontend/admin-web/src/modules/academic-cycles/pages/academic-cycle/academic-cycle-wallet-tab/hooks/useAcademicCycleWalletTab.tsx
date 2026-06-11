import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { useGetWalletForAcademicCycle } from "@/modules/academic-cycles/hooks/wallet/useGetWalletForAcademicCycle";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useDeleteWalletByIdForAcademicCycle } from "@/modules/academic-cycles/hooks/wallet/useDeleteWalletByIdForAcademicCycle";
import { useCreateUpdateWalletForAcademicCycle } from "@/modules/academic-cycles/hooks/wallet/useCreateUpdateWalletForAcademicCycle";

export const useAcademicCycleWalletTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleWallet>();

    // Queries
    const walletForAcademicCycleQuery = useGetWalletForAcademicCycle(academicCycleId!);

    // Mutations
    const deleteWalletByIdForAcademicCycle = useDeleteWalletByIdForAcademicCycle();
    const createUpdateWalletForAcademicCycle = useCreateUpdateWalletForAcademicCycle();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
            wallet: {
                data: walletForAcademicCycleQuery.data ?? [],
                isError: walletForAcademicCycleQuery.isError,
                isLoading: walletForAcademicCycleQuery.isLoading,
                isFetching: walletForAcademicCycleQuery.isFetching
            }
        },
        mutations: {
            wallet: {
                delete: deleteWalletByIdForAcademicCycle,
                createUpdate: createUpdateWalletForAcademicCycle
            },
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
        }
    }
}
