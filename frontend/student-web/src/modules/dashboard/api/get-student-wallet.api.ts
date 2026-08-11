import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentWalletResponse } from "@/interfaces/responses/student-wallet.response";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const getStudentWalletAsync = async ({ academicCycleId, academicCycleEnrollmentId }: Options): Promise<StudentWalletResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<StudentWalletResponse>("/wallet/wallet.json");
        return data;
    }

    const { data } = await api.get<StudentWalletResponse>(`/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet`);

    return data;
}
