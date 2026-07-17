import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolSubjectRequest } from "@/interfaces/requests/academic-cycle-school-subject.request";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

interface Options {
    id: string;
    academicCycleSchoolSubjectRequestLike: Partial<AcademicCycleSchoolSubjectRequest>
}

export const createUpdateAcademicCycleSchoolSubjectActionAsync = async ({ id, academicCycleSchoolSubjectRequestLike }: Options): Promise<AcademicCycleSchoolSubjectResponse> => {
    await sleep();

    const isCreating = id === "new";
    const { academicCycleId } = academicCycleSchoolSubjectRequestLike;

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...academicCycleSchoolSubjectRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as AcademicCycleSchoolSubjectResponse;
    }

    const { data } = await api<AcademicCycleSchoolSubjectResponse>({
        url: isCreating ? `/academic-cycles/${academicCycleId}/school-subjects` : `/academic-cycles/${academicCycleId}/school-subjects/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: { ...academicCycleSchoolSubjectRequestLike }
    });

    return {
        ...data,
    };
}
