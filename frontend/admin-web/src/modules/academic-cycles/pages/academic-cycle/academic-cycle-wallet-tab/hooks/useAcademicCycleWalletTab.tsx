import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetAcademicCycleWallet } from "@/modules/academic-cycles/hooks/academic-cycle-wallet/useGetAcademicCycleWallet";
import { useDeleteAcademicCycleWalletItemById } from "@/modules/academic-cycles/hooks/academic-cycle-wallet/useDeleteAcademicCycleWalletItemById";
import { useCreateUpdateAcademicCycleWalletItem } from "@/modules/academic-cycles/hooks/academic-cycle-wallet/useCreateUpdateAcademicCycleWalletItem";


export const useAcademicCycleWalletTab = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AcademicCycleWalletItemResponse>();

    // Queries
    const getAcademicCycleWalletQuery = useGetAcademicCycleWallet({ academicCycleId: academicCycleId! });

    // Mutations
    const deleteAcademicCycleWalletMutation = useDeleteAcademicCycleWalletItemById();
    const createUpdateAcademicCycleWalletMutation = useCreateUpdateAcademicCycleWalletItem();

    return {
        context: {
            academicCycleId,
            academicCycle,
            isLocked
        },
        queries: {
            wallet: {
                get: getAcademicCycleWalletQuery
            }
        },
        mutations: {
            wallet: {
                delete: deleteAcademicCycleWalletMutation,
                createUpdate: createUpdateAcademicCycleWalletMutation
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
