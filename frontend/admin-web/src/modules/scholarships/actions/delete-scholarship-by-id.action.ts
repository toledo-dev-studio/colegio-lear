import { api } from "@/api/client";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import { sleep } from "@/lib/extensions/promises";

interface Options {
    id: string
}

export const deleteScholarshipByIdActionAsync = async ({ id }: Options): Promise<string> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return id;

    await api.delete(`/scholarships/${id}`);
    return id;
}
