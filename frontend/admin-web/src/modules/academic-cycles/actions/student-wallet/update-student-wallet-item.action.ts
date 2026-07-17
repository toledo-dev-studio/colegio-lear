import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentWalletItemRequest } from "@/interfaces/requests/student-wallet-item.request";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";

interface Options {
    id: string;
    academicCycleId: string;
    academicCycleEnrollmentId: string;
    studentWalletItemRequestLike: Partial<StudentWalletItemRequest>
}

export const updateStudentWalletItemActionAsync = async ({ id, academicCycleId, academicCycleEnrollmentId, studentWalletItemRequestLike }: Options): Promise<StudentWalletItemResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...studentWalletItemRequestLike,
            academicCycleEnrollmentId,
            academicCycleId,
            id,
        } as StudentWalletItemResponse;
    }

    const { data } = await api<StudentWalletItemResponse>({
        url: `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/wallet/${id}`,
        method: "PATCH",
        data: { ...studentWalletItemRequestLike }
    });

    return {
        ...data,
    };
}