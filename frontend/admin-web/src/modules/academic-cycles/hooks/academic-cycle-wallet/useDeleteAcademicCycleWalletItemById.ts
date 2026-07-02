import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { deleteAcademicCycleWalletItemByIdActionAsync } from "../../actions/academic-cycle-wallet/delete-wallet-item-by-id-for-academic-cycle.action";

export const useDeleteAcademicCycleWalletItemById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAcademicCycleWalletItemByIdActionAsync,
        onSuccess: (response: { id: string, academicCycleId: string }) => {
            // Set query data for academic cycle wallet list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId }],
                (prev: AcademicCycleWallet[] = []) => [...prev.filter(item => item.id !== response.id)]
            );
        },
    });
}
