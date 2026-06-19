import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { ScholarshipFilter } from "@/interfaces/filters/scholarship.filter";

interface Options extends ScholarshipFilter {
    query?: string;
}

export const getScholarshipsActionAsync = async ({ query, name, discountPercentage, isActive }: Options): Promise<Scholarship[]> => {
    await sleep();

    let endpoint = "/scholarships";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/scholarships/scholarships.json";

    const { data } = await api.get<Scholarship[]>(endpoint, {
        params: {
            q: query,
            name,
            discountPercentage,
            isActive,
        }
    });

    return data;
}
