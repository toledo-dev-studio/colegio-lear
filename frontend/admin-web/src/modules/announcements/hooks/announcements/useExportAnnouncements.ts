import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAnnouncementsActionAsync } from "../../actions/announcements/get-announcements.action";

export const useExportAnnouncements = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const publishedAt = searchParams.get('published-at')?.trim() || '';
    const expiresAt = searchParams.get('expires-at')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useMutation({
        mutationFn: () => getAnnouncementsActionAsync({
            query,
            name,
            publishedAt,
            expiresAt,
            status
        }),
    });
}
