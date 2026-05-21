import { api } from "@/api/client";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import { sleep } from "@/lib/extensions/promises";

interface Options {
    id: string
}

export const deleteAcademicLevelByIdActionAsync = async ({ id }: Options): Promise<string> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return id;

    await api.delete(`/academic-levels/${id}`);
    return id;
}
