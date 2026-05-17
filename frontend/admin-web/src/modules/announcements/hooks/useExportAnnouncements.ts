import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_ANNOUNCEMENTS_QUERY_KEY } from "../lib/queries-key";
import { getAnnouncementsActionAsync } from "../actions/announcements/get-announcements.action";

export const useExportAnnouncements = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const publishedAt = searchParams.get('published-at')?.trim() || '';
    const expiresAt = searchParams.get('expires-at')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_ANNOUNCEMENTS_QUERY_KEY, { query, name, publishedAt, expiresAt, status }],
        queryFn: () => getAnnouncementsActionAsync({
            query,
            name,
            publishedAt, 
            expiresAt,
            status
        }),
        enabled: false,
    });
}
