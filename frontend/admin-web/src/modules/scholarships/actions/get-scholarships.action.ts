import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Scholarship } from "@/interfaces/entites/scholarship";

interface Options {
    query?: string;
    status?: boolean
}

export const getScholarshipsActionAsync = async ({ query = '', status = true }: Options): Promise<Scholarship[]> => {
    await sleep();

    const { data } = await api.get<Scholarship[]>('/scholarships/scholarships.json', {
        params: {
            q: query,
            status
        }
    });

    return data;
}
