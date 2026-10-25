import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolSubjectRequest } from "@/interfaces/requests/academic-cycle-school-subject.request";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

interface Options {
    id: string;
    academicCycleSchoolSubjectRequestLike: Partial<AcademicCycleSchoolSubjectRequest>
}

export const createUpdateAcademicCycleSchoolSubjectAsync = async ({ id, academicCycleSchoolSubjectRequestLike }: Options): Promise<AcademicCycleSchoolSubjectResponse> => {
    await sleep();

    const isCreating = id === "new";
    const { academicCycleId } = academicCycleSchoolSubjectRequestLike;

    if (IS_MOCKABLE) {
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
