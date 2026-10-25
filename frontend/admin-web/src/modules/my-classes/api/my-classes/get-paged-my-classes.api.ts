import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { MyClassFilter } from "@/interfaces/filters/my-class.filter";
import type { MyClassResponse } from "@/interfaces/responses/my-class.response";

interface Options extends MyClassFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedMyClassesAsync = async ({ query, page = 1, pageSize = 10, name, status, academicCycleStatus }: Options): Promise<PagedResponse<MyClassResponse>> => {
    await sleep();

    let endpoint = "/me/school-groups/paged";
    if (IS_MOCKABLE)
        endpoint = "/my-classes/paged-my-classes.json";

    const { data } = await api.get<PagedResponse<MyClassResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            status,
            academicCycleStatus,
        }
    });

    return {
        ...data
    };
}