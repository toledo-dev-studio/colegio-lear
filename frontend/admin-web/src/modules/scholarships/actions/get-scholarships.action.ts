import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    query?: string;
    name?: string;
    status?: boolean,
    discountPercentage?: number
}

export const getScholarshipsActionAsync = async ({ query, name, status, discountPercentage }: Options): Promise<Scholarship[]> => {
    await sleep();

    let endpoint = "/scholarships";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/scholarships/scholarships.json";

    const { data } = await api.get<Scholarship[]>(endpoint, {
        params: {
            q: query,
            name,
            status,
            discountPercentage,
        }
    });

    return data;
}
