import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    query?: string;
    name?: string;
    status?: boolean
}

export const getAcademicLevelsActionAsync = async ({ query, name, status }: Options): Promise<AcademicLevel[]> => {
    await sleep();

    let endpoint = "/academic-levels";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-levels/academic-levels.json";

    const { data } = await api.get<AcademicLevel[]>(endpoint, {
        params: {
            q: query,
            name,
            status
        }
    });

    return data;
}
