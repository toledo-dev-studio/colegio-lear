import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";

export const CreateUpdateSchoolSubjectActionAsync = async (schoolSubjectLike: Partial<SchoolSubject>): Promise<SchoolSubject> => {
    await sleep(500);

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