import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_STUDENT_WALLET_PAYMENTS_QUERY_KEY, GET_STUDENT_WALLET_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import type { StudentWalletResponse } from "@/interfaces/responses/student-wallet.response";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import { updateStudentWalletItemAsync } from "../../api/student-wallet/update-student-wallet-item.api";

export const useUpdateStudentWalletItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudentWalletItemAsync,
        onSuccess: (response: StudentWalletItemResponse) => {
            // Set query data for academic cycle wallet list to avoid refetch api
            queryClient.setQueryData(
                [GET_STUDENT_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId, academicCycleEnrollmentId: response.academicCycleEnrollmentId }],
                (prev: StudentWalletResponse) => {
                    if (!prev) return prev;

                    const index = prev.items.findIndex(item => item.id === response.id);

                    if (index === -1) return prev;

                    const previousItem = prev.items[index];

                    const summary = { ...prev.summary };

                    if (response.isForgiven) {
                        summary.outstanding -= previousItem.outstandingAmount;

                        if (previousItem.status === "overdue") {
                            summary.overdue -= previousItem.outstandingAmount;
                        }

                        // Reset query data for payments when a payment is forgiven 
                        queryClient.refetchQueries({ queryKey: [GET_STUDENT_WALLET_PAYMENTS_QUERY_KEY, { academicCycleId: response.academicCycleId, academicCycleEnrollmentId: response.academicCycleEnrollmentId }]});
                    }

                    const items = [...prev.items];
                    items[index] = {
                        ...previousItem,
                        ...response,
                    };

                    return {
                        ...prev,
                        summary,
                        items,
                    };
                }
            );
        }
    });
}
