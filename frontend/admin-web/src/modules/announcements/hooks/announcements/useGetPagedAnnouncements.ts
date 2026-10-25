import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_PAGED_ANNOUNCEMENTS_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";
import { getPagedAnnouncementsAsync } from "../../api/announcements/get-paged-announcements.api";
import { isValidValueWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import type { AnnouncementsStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";

export const useGetPagedAnnouncements = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined);
    const publishedAt = isValidValueWithDefault(searchParams.get("published-at")?.trim(), undefined);
    const expiresAt = isValidValueWithDefault(searchParams.get("expires-at")?.trim(), undefined);
    const status = isValidValueWithDefault(searchParams.get("status") as AnnouncementsStatusKey, undefined);

    const queryResult = useQuery({
        queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY, { query, page, pageSize, name, publishedAt, expiresAt, status, }],
        queryFn: () => getPagedAnnouncementsAsync({
            query,
            page,
            pageSize,
            name,
            publishedAt,
            expiresAt,
            status,
        }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
