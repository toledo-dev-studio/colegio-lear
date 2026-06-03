import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { createUpdateWalletForAcademicCycleActionAsync } from "../../actions/wallet/create-update-wallet-for-academic-cycle";

export const useCreateUpdateWalletForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateWalletForAcademicCycleActionAsync,
        onSuccess: (response: AcademicCycleWallet) => {
            // Set query data for student guardians list to avoid refetch api
            queryClient.setQueryData([GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId }], (prev: AcademicCycleWallet[] = []) => [...prev.filter(item => item.id !== response.id), response]);
        }
    });
}
