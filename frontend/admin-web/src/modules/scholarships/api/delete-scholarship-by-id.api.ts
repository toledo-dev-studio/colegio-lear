import { api } from "@/api/client";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import { sleep } from "@/lib/extensions/promises";

interface Options {
    id: string
}

export const deleteScholarshipByIdAsync = async ({ id }: Options): Promise<string> => {
    await sleep();

    if (IS_MOCKABLE)
        return id;

    await api.delete(`/scholarships/${id}`);
    return id;
}
