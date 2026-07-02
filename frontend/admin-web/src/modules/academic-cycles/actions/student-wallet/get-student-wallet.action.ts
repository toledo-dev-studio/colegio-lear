import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentWalletResponse } from "@/interfaces/responses/student-wallet.response";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const getStudentWalletActionAsync = async ({ academicCycleId, academicCycleEnrollmentId }: Options): Promise<StudentWalletResponse> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/student-wallet/student-wallet.json";

    // REMOVE
    endpoint = "http://localhost/api/students/student-wallet/student-wallet.json";

    const { data } = await api.get<StudentWalletResponse>(endpoint);
    
    return data;
}
