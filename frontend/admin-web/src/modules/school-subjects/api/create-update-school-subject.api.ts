import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SchoolSubjectRequest } from "@/interfaces/requests/school-subject.request";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

interface Options {
    id: string;
    schoolSubjectRequestLike: Partial<SchoolSubjectRequest>;
}

export const createUpdateSchoolSubjectAsync = async ({ id, schoolSubjectRequestLike }: Options): Promise<SchoolSubjectResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
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