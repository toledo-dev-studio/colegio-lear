import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Scholarship } from "@/interfaces/entites/scholarship";
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

    const { 
        query = '', 
        page = 1, 
        pageSize = 1,
        name,
        status,
        discountPercentage, 
    } = props;

    const { data } = await api.get<PagedResponse<Scholarship>>('/scholarships/paged-scholarships.json', {
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
