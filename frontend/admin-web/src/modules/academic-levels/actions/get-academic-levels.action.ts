import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";

interface Options {
    query?: string;
    status?: boolean
}

export const getAcademicLevelsActionAsync = async ({ query = '', status = true }: Options): Promise<AcademicLevel[]> => {
    await sleep();

    const { data } = await api.get<AcademicLevel[]>('/academic-levels/academic-levels.json', {
        params: {
            q: query,
            status
        }
    });

    return data;
}
