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

    let endpoint = `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet`;

    if (IS_MOCKABLE)
        endpoint = "/students/student-wallet/student-wallet.json";
    
    const { data } = await api.get<StudentWalletResponse>(endpoint);
    
    return data;
}
