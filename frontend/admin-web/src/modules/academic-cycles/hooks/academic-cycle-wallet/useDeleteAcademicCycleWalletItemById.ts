import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";
import { deleteAcademicCycleWalletItemByIdAsync } from "../../api/academic-cycle-wallet/delete-wallet-item-by-id-for-academic-cycle.api";

export const useDeleteAcademicCycleWalletItemById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAcademicCycleWalletItemByIdAsync,
        onSuccess: (response: { id: string, academicCycleId: string }) => {
            // Set query data for academic cycle wallet list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId }],
                (prev: AcademicCycleWalletItemResponse[] = []) => [...prev.filter(item => item.id !== response.id)]
            );
        },
    });
}
