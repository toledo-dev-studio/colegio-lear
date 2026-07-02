import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_STUDENT_WALLET_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import { updateStudentWalletItemActionAsync } from "../../actions/student-wallet/update-student-wallet-item.action";
import type { StudentWalletResponse } from "@/interfaces/responses/student-wallet.response";

export const useUpdateStudentWalletItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudentWalletItemActionAsync,
        onSuccess: (response: StudentWalletItemResponse) => {
            // Set query data for academic cycle wallet list to avoid refetch api
            queryClient.setQueryData(
                [GET_STUDENT_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId, academicCycleEnrollmentId: response.academicCycleEnrollmentId }],
                (prev: StudentWalletResponse) => {
                    const index = prev.items.findIndex(item => item.id === response.id);
                    const prevItem = prev.items[index];
                    prev.items[index] = {
                        ...prevItem,
                        ...response,
                    };
                    return prev;
                }
            );
        }
    });
}
