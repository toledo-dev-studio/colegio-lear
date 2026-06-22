import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicLevelFilter } from "@/interfaces/filters/academic-level.filter";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";

interface Options extends AcademicLevelFilter {
    query?: string;
}

export const getAcademicLevelsActionAsync = async ({ query, name, isActive }: Options): Promise<AcademicLevelResponse[]> => {
    await sleep();

    let endpoint = "/academic-levels";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-levels/academic-levels.json";

    const { data } = await api.get<AcademicLevelResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            isActive
        }
    });

    return data;
}
