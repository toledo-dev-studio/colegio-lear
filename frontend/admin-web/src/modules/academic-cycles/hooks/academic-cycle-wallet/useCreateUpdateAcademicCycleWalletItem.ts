import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";
import { createUpdateAcademicCycleWalletItemActionAsync } from "../../actions/academic-cycle-wallet/create-update-academic-cycle-wallet-item.action";

export const useCreateUpdateAcademicCycleWalletItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAcademicCycleWalletItemActionAsync,
        onSuccess: (response: AcademicCycleWalletItemResponse) => {
            // Set query data for academic cycle wallet list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId }],
                (prev: AcademicCycleWalletItemResponse[] = []) => {
                    const index = prev.findIndex(item => item.id === response.id);
                    if (index === -1)
                        return [...prev, response]
                    prev[index] = response;
                    return [...prev];
                }
            );
        }
    });
}
