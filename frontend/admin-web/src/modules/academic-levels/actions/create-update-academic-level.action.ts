import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";

export const CreateUpdateAcademicLevelAction = async (academicLevelLike: Partial<AcademicLevel>): Promise<AcademicLevel> => {
    await sleep();

    const { id } = academicLevelLike;

    const isCreating = id === "new";

    const { data } = await api<AcademicLevel>({
        url: isCreating ? '/academic-levels' : `/academic-levels/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: academicLevelLike
    });

    return {
        ...data,
    };
}
