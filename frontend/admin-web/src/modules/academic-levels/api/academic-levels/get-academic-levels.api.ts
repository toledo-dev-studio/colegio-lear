import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicLevelFilter } from "@/interfaces/filters/academic-level.filter";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";

interface Options extends AcademicLevelFilter {
    query?: string;
}

export const getAcademicLevelsAsync = async ({ query, name, isActive }: Options): Promise<AcademicLevelResponse[]> => {
    await sleep();

    let endpoint = "/academic-levels";

    if (IS_MOCKABLE)
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
