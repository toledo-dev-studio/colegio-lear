import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { isValidBooleanString, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAnnouncementsActionAsync } from "../../actions/announcements/get-announcements.action";

export const useExportAnnouncements = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const publishedAt = searchParams.get("published-at")?.trim() || undefined;
    const expiresAt = searchParams.get("expires-at")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

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
