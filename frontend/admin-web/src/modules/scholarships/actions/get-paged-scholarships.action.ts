import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    status?: boolean,
    discountPercentage?: number,
}

export const getPagedScholarshipsActionAsync = async (props: Options): Promise<PagedResponse<Scholarship>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, name, status, discountPercentage } = props;

    let endpoint = "/scholarships/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/scholarships/paged-scholarships.json";

    const { data } = await api.get<PagedResponse<Scholarship>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            status,
            discountPercentage,
        }
    });    

    return {
        ...data
    };
}
