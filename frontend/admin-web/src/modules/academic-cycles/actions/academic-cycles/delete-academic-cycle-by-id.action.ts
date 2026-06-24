import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string
}

export const deleteAcademicCycleByIdActionAsync = async ({ id }: Options): Promise<string> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return id;

    await api.delete(`/academic-cycles/${id}`);
    return id;
}
