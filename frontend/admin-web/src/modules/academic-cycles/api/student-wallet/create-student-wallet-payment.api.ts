import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentWalletPaymentRequest } from "@/interfaces/requests/student-wallet-payment.request";
import type { StudentWalletPaymentResponse } from "@/interfaces/responses/student-wallet-payment.response";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
    studentWalletPaymentRequestLike: Partial<StudentWalletPaymentRequest>
}

export const createStudentWalletPaymentAsync = async ({ academicCycleId, academicCycleEnrollmentId, studentWalletPaymentRequestLike }: Options): Promise<StudentWalletPaymentResponse> => {
    await sleep();

    const { studentWalletItemId } = studentWalletPaymentRequestLike;

    if (IS_MOCKABLE) {
        return {
            ...studentWalletPaymentRequestLike,
            academicCycleId,
            academicCycleEnrollmentId,
            folio: generateTemporalId(),
            id: generateTemporalId(),
        } as StudentWalletPaymentResponse;
    }

    const { data } = await api<StudentWalletPaymentResponse>({
        url: `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet/${studentWalletItemId}/payments`,
        method: "POST",
        data: { ...studentWalletPaymentRequestLike }
    });

    return {
        ...data,
    };
}
