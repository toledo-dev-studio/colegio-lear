import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { getAnnouncementsActionAsync } from "../../actions/announcements/get-announcements.action";
import type { AnnouncementsStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";

export const useGetAnnouncements = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined);
    const publishedAt = isValidValueWithDefault(searchParams.get("published-at")?.trim(), undefined);
    const expiresAt = isValidValueWithDefault(searchParams.get("expires-at")?.trim(), undefined);
    const status = isValidValueWithDefault(searchParams.get("status") as AnnouncementsStatusKey, undefined);

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
