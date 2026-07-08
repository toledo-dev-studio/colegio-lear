import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentGuardianRequest } from "@/interfaces/requests/student-guardian.request";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";

interface Options {
    id: string;
    studentId: string;
    studentGuardianRequestLike: Partial<StudentGuardianRequest>;
}

export const createUpdateStudentGuardianForStudentActionAsync = async ({ id, studentId, studentGuardianRequestLike }: Options): Promise<StudentGuardianResponse> => {
    await sleep();

    const isCreating = id === "new";

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        return {
            ...studentGuardianRequestLike,
            studentId,
            id: isCreating ? generateTemporalId() : id,
        } as StudentGuardianResponse;
    }

    const { data } = await api<StudentGuardianResponse>({
        url: isCreating ? `/students/${studentId}/guardians` : `/students/${studentId}/guardians/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: { ...studentGuardianRequestLike }
    });

    return {
        ...data,
    };
}
