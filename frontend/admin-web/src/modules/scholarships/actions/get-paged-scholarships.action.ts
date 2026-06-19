import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { ScholarshipFilter } from "@/interfaces/filters/scholarship.filter";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";

interface Options extends ScholarshipFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedScholarshipsActionAsync = async (props: Options): Promise<PagedResponse<ScholarshipResponse>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, name, isActive, discountPercentage } = props;

    let endpoint = "/scholarships/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/scholarships/paged-scholarships.json";

    const { data } = await api.get<PagedResponse<ScholarshipResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            isActive,
            discountPercentage,
        }
    });    

    return {
        ...data
    };
}
