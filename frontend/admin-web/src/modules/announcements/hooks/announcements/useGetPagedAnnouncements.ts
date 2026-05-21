import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { GET_PAGED_ANNOUNCEMENTS_QUERY_KEY } from "@/lib/queries-key/announcements-queries-key";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { getPagedAnnouncementsActionAsync } from "../../actions/announcements/get-paged-announcements.action";

export const useGetPagedAnnouncements = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = stringToNumberWithDefault(searchParams.get('page'), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get('pageSize'), 10);

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const publishedAt = searchParams.get('published-at')?.trim() || '';
    const expiresAt = searchParams.get('expires-at')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    const queryResult = useQuery({
        queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY, { query, page, pageSize, name, publishedAt, expiresAt, status, }],
        queryFn: () => getPagedAnnouncementsActionAsync({
            query,
            page,
            pageSize,
            name,
            publishedAt,
            expiresAt,
            status,
        }),
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
