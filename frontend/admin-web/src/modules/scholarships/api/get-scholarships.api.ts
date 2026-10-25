import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { ScholarshipFilter } from "@/interfaces/filters/scholarship.filter";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";

interface Options extends ScholarshipFilter {
    query?: string;
}

export const getScholarshipsAsync = async ({ query, name, discountPercentage, isActive }: Options): Promise<ScholarshipResponse[]> => {
    await sleep();

    let endpoint = "/scholarships";

    if (IS_MOCKABLE)
        endpoint = "/scholarships/scholarships.json";

    const { data } = await api.get<ScholarshipResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            discountPercentage,
            isActive,
        }
    });

    return data;
}
