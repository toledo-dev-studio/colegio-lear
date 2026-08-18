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

    let endpoint = `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet/payments`;

    if (IS_MOCKABLE)
        endpoint = "/students/student-wallet-payments/student-wallet-payments.json";

    const { data } = await api.get<StudentWalletPaymentResponse[]>(endpoint);

    return data;
}
