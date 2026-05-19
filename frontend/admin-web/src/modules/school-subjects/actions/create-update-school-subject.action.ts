import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";

export const createUpdateSchoolSubjectActionAsync = async (schoolSubjectLike: Partial<SchoolSubject>): Promise<SchoolSubject> => {
    await sleep();

    const { id } = schoolSubjectLike;

    const isCreating = id === "new";

    const { data } = await api<SchoolSubject>({
        url: isCreating ? '/school-subjects' : `/school-subjects/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: schoolSubjectLike
    });

    return {
        ...data,
    };
}