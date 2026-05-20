import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateSchoolSubjectActionAsync = async (schoolSubjectLike: Partial<SchoolSubject>): Promise<SchoolSubject> => {
    await sleep();

    const { id } = schoolSubjectLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        schoolSubjectLike.id = isCreating ? generateTemporalId() : id;
        return schoolSubjectLike as SchoolSubject;
    }

    const { data } = await api<SchoolSubject>({
        url: isCreating ? '/school-subjects' : `/school-subjects/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: schoolSubjectLike
    });

    return {
        ...data,
    };
}