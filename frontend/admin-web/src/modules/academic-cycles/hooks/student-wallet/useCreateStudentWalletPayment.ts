import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StudentWalletResponse } from "@/interfaces/responses/student-wallet.response";
import type { StudentWalletPaymentResponse } from "@/interfaces/responses/student-wallet-payment.response";
import { createStudentWalletPaymentActionAsync } from "../../actions/student-wallet/create-student-wallet-payment.action";
import { GET_STUDENT_WALLET_PAYMENTS_QUERY_KEY, GET_STUDENT_WALLET_QUERY_KEY } from "@/lib/queries-key/students-queries-key";

export const useCreateStudentWalletPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createStudentWalletPaymentActionAsync,
        onSuccess: (response: StudentWalletPaymentResponse) => {
            // Invalidate query data for academic cycle wallet list to refetch api
            queryClient.setQueryData(
                [GET_STUDENT_WALLET_QUERY_KEY, { academicCycleId: response.academicCycleId, academicCycleEnrollmentId: response.academicCycleEnrollmentId }],
                (prev: StudentWalletResponse) => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        summary: {
                            ...prev.summary,
                            outstanding: prev.summary.outstanding - response.amount,
                            paid: prev.summary.paid + response.amount,
                        },
                        items: prev.items.map(item => {
                            if (item.id !== response.studentWalletItemId)
                                return item;

                            const outstanding = Math.max(
                                item.outstandingAmount - response.amount,
                                0
                            );

                            return {
                                ...item,
                                outstandingAmount: outstanding,
                                status: outstanding === 0
                                    ? "paid"
                                    : item.status
                            };
                        })
                    };
                }
            );

            // Set query data for academic cycle wallet list to avoid refetch api
            queryClient.setQueryData(
                [GET_STUDENT_WALLET_PAYMENTS_QUERY_KEY, { academicCycleId: response.academicCycleId, academicCycleEnrollmentId: response.academicCycleEnrollmentId }],
                (prev: StudentWalletPaymentResponse[] = []) => [response, ...prev]
            );
        }
    });
}
