import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string
}

export const deleteAcademicCycleByIdActionAsync = async ({ id }: Options): Promise<string> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return id;

    await api.delete(`/academic-cycles/${id}`);
    return id;
}
