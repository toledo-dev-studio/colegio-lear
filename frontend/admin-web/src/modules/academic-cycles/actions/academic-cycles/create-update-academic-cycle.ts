import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { AcademicCycle } from "@/interfaces/entites/academic-cycle";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateAcademicCycleActionAsync = async (academicCycleLike: Partial<AcademicCycle>): Promise<AcademicCycle> => {
    await sleep();

    const { id } = academicCycleLike;
    const isCreating = id === undefined;

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        academicCycleLike.id = isCreating ? generateTemporalId() : id;
        return academicCycleLike as AcademicCycle;
    }

    const { data } = await api<AcademicCycle>({
        url: isCreating ? "/academic-cycles" : `/academic-cycles/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: {
            ...academicCycleLike,
        }
    });

    return {
        ...data,
    };
}
