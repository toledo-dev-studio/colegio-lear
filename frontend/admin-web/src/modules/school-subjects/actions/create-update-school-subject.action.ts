import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { SchoolSubjectRequest } from "@/interfaces/requests/school-subject.request";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

interface Options {
    id: string;
    schoolSubjectRequestLike: Partial<SchoolSubjectRequest>;
}

export const createUpdateSchoolSubjectActionAsync = async ({ id, schoolSubjectRequestLike }: Options): Promise<SchoolSubjectResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...schoolSubjectRequestLike,
            id: isCreating ? generateTemporalId() : id
        } as SchoolSubjectResponse;
    }

    const { data } = await api<SchoolSubjectResponse>({
        url: isCreating ? "/school-subjects" : `/school-subjects/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: schoolSubjectRequestLike
    });

    return {
        ...data,
        academicLevel: { id: schoolSubjectRequestLike.academicLevelId, name: schoolSubjectRequestLike.academicLevel?.name },
        educationLevel: { id: schoolSubjectRequestLike.educationLevelId, name: schoolSubjectRequestLike.educationLevel?.name }
    };
}