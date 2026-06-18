import { useState } from "react";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";
import { useGetPaymentConcepts } from "@/modules/payment-concepts/hooks/useGetPaymentConcepts";
import { useGetPagedPaymentConcepts } from "@/modules/payment-concepts/hooks/useGetPagedPaymentConcepts";
import { useDeletePaymentConceptById } from "@/modules/payment-concepts/hooks/useDeletePaymentConceptById";

export const usePaymentConceptsPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<PaymentConceptResponse>();

    // Queries
    const pagedPaymentConceptsQuery = useGetPagedPaymentConcepts();

    // Mutations
    const deletePaymentConceptMutation = useDeletePaymentConceptById();
    const exportPaymentConceptsMutation = useGetPaymentConcepts();

    return {
        loader: {
            show: showLoading,
            hide: hideLoading
        },
        advancedFilters: {
            isOpen: isOpenAdvancedFiltersPanel,
            open: () => setIsOpenAdvancedFiltersPanel(true),
            close: () => setIsOpenAdvancedFiltersPanel(false),
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
            open: openDeleteModal
        },
        queries: {
            paymentConcepts: {
                paged: pagedPaymentConceptsQuery
            }
        },
        mutations: {
            paymentConcepts: {
                export: exportPaymentConceptsMutation,
                delete: deletePaymentConceptMutation
            }
        }
    }
}
