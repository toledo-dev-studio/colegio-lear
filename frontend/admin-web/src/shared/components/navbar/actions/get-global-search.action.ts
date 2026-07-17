import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { GlobalSearchResponse } from "@/interfaces/responses/global-search.response";

interface Options {
    query: string;
}

export const getGlobalSearchActionAsync = async ({ query }: Options): Promise<GlobalSearchResponse[]> => {
    await sleep();

    let endpoint = "/global-search";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/global-search/global-search.json";

    const { data } = await api.get<GlobalSearchResponse[]>(endpoint, {
        params: {
            q: query,
        }
    });

    return data;
}
