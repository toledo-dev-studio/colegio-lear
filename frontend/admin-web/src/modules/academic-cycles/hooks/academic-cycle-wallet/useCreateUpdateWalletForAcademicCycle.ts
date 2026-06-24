import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleWalletResponse } from "@/interfaces/responses/academic-cycle-wallet.response";
import { createUpdateAcademicCycleWalletActionAsync } from "../../actions/academic-cycle-wallet/create-update-academic-cycle-wallet";

export const useCreateUpdateAcademicCycleWallet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAcademicCycleWalletActionAsync,
        onSuccess: (response: AcademicCycleWalletResponse) => {
            // Set query data for academic cycle wallet list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId }], 
                (prev: AcademicCycleWallet[] = []) => [...prev.filter(item => item.id !== response.id), response]
            );
        }
    });
}
