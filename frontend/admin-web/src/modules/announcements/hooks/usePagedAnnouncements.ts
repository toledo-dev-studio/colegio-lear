import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { GET_PAGED_ANNOUNCEMENTS_QUERY_KEY } from "../lib/queries-key";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getPagedAnnouncementsActionAsync } from "../actions/announcements/get-paged-announcements.action";

export const usePagedAnnouncements = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const publishedAt = searchParams.get('published-at')?.trim() || '';
    const expiresAt = searchParams.get('expires-at')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_ANNOUNCEMENTS_QUERY_KEY, { query, page, pageSize, name, publishedAt, expiresAt, status, }],
        queryFn: () => getPagedAnnouncementsActionAsync({
            query,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
            name, 
            publishedAt, 
            expiresAt,
            status,
        }),
    });
}
