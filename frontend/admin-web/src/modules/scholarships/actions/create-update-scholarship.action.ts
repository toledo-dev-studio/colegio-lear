import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Scholarship } from "@/interfaces/entites/scholarship";

export const CreateUpdateScholarshipActionAsync = async (scholarshipLike: Partial<Scholarship>): Promise<Scholarship> => {
    await sleep();

    const { id } = scholarshipLike;

    const isCreating = id === "new";

    const { data } = await api<Scholarship>({
        url: isCreating ? '/scholarships' : `/scholarships/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: scholarshipLike
    });

    return {
        ...data,
    };
}
