import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";

interface Options {
    query?: string;
    name?: string;
    status?: boolean
}

export const getAcademicLevelsActionAsync = async ({ 
    query = '',
    name, 
    status
}: Options): Promise<AcademicLevel[]> => {
    await sleep();

    const { data } = await api.get<AcademicLevel[]>('/academic-levels/academic-levels.json', {
        params: {
            q: query,
            name,
            status
        }
    });

    return data;
}
