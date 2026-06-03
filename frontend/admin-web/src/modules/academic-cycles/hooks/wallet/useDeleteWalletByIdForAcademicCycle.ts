import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { deleteWalletByIdForAcademicCycleActionAsync } from "../../actions/wallet/delete-wallet-by-id-for-academic-cycle";

export const useDeleteWalletByIdForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWalletByIdForAcademicCycleActionAsync,
        onSuccess: (response: { academicCycleId: string, academicCycleWalletId: string }) => {
            // Set query data for student guardians list to avoid refetch api
            queryClient.setQueryData([GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId }], (prev: AcademicCycleWallet[] = []) => [...prev.filter(item => item.id !== response.academicCycleWalletId)]);
        },
    });
}
