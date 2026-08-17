import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentWalletPaymentResponse } from "@/interfaces/responses/student-wallet-payment.response";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const getStudentWalletPaymentsAsync = async ({ academicCycleId, academicCycleEnrollmentId }: Options): Promise<StudentWalletPaymentResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<StudentWalletPaymentResponse[]>(`/wallet/payments.json`);
        return data;
    }

    const { data } = await api.get<StudentWalletPaymentResponse[]>(`/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet/payments`);

    return data;
}
