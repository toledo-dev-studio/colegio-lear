import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateAcademicLevelAction = async (academicLevelLike: Partial<AcademicLevel>): Promise<AcademicLevel> => {
    await sleep();

    const { id } = academicLevelLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        academicLevelLike.id = isCreating ? generateTemporalId() : id;
        return academicLevelLike as AcademicLevel;
    }

    const { data } = await api<AcademicLevel>({
        url: isCreating ? '/academic-levels' : `/academic-levels/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: academicLevelLike
    });

    return {
        ...data,
    };
}
