import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { GlobalSearchResponse } from "@/interfaces/responses/global-search.response";

interface Options {
    query: string;
}

export const getGlobalSearchAsync = async ({ query }: Options): Promise<GlobalSearchResponse[]> => {
    await sleep();

    let endpoint = "/global-search";

    if (IS_MOCKABLE)
        endpoint = "/global-search/global-search.json";

    const { data } = await api.get<GlobalSearchResponse[]>(endpoint, {
        params: {
            q: query,
        }
    });

    return data;
}
