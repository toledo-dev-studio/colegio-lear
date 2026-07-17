import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentRequest } from "@/interfaces/requests/academic-cycle-enrollment.request";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
    id: string;
    academicCycleEnrollmentRequestLike: Partial<AcademicCycleEnrollmentRequest>
}

export const createUpdateAcademicCycleEnrollmentActionAsync = async ({ id, academicCycleEnrollmentRequestLike }: Options): Promise<AcademicCycleEnrollmentResponse> => {
    await sleep();

    const isCreating = id === "new";
    const { academicCycleId } = academicCycleEnrollmentRequestLike;
    
    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...academicCycleEnrollmentRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as AcademicCycleEnrollmentResponse;
    }

    const { data } = await api<AcademicCycleEnrollmentResponse>({
        url: isCreating 
            ? `/academic-cycles/${academicCycleId}/enrollments` 
            : `/academic-cycles/${academicCycleId}/enrollments/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: { ...academicCycleEnrollmentRequestLike }
    });

    return {
        ...data,
    };
}
