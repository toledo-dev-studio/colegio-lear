import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Scholarship } from "@/interfaces/entites/scholarship";

interface Options {
    query?: string;
    name?: string;
    status?: boolean,
    discountPercentage?: number
}

export const getScholarshipsActionAsync = async ({ query = '', name, status, discountPercentage }: Options): Promise<Scholarship[]> => {
    await sleep();

    const { data } = await api.get<Scholarship[]>('/scholarships/scholarships.json', {
        params: {
            q: query,
            name,
            status,
            discountPercentage,
        }
    });

    return data;
}
