import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentWalletSummaryResponse } from "@/interfaces/responses/student-wallet-summary.response";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const getStudentWalletSummaryActionAsync = async ({ academicCycleId, academicCycleEnrollmentId }: Options): Promise<StudentWalletSummaryResponse> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        const { data } = await api.get<StudentWalletSummaryResponse>("http://localhost/api/students/student-wallet-summary/student-wallet-summary.json");
        return data;
    }

    const { data } = await api.get<StudentWalletSummaryResponse>(`/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet/summary`);

    return data;
}
