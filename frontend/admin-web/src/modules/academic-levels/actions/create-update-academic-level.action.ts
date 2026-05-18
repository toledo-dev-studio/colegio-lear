import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";

export const createUpdateAcademicLevelAction = async (academicLevelLike: Partial<AcademicLevel>): Promise<AcademicLevel> => {
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
