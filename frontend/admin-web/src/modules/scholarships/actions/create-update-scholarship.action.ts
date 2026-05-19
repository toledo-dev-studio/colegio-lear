import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateScholarshipActionAsync = async (scholarshipLike: Partial<Scholarship>): Promise<Scholarship> => {
    await sleep();

    const { id } = scholarshipLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        scholarshipLike.id = isCreating ? generateTemporalId() : id;
        return scholarshipLike as Scholarship;
    }

    const { data } = await api<Scholarship>({
        url: isCreating ? '/scholarships' : `/scholarships/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: scholarshipLike
    });

    return {
        ...data,
    };
}
