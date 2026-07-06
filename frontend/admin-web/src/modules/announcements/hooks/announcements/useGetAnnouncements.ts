import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAnnouncementsActionAsync } from "../../actions/announcements/get-announcements.action";

export const useGetAnnouncements = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined);
    const publishedAt = isValidValueWithDefault(searchParams.get("published-at")?.trim(), undefined);
    const expiresAt = isValidValueWithDefault(searchParams.get("expires-at")?.trim(), undefined);
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    return useMutation({
        mutationFn: () => getAnnouncementsActionAsync({
            query,
            name,
            publishedAt,
            expiresAt,
            isActive
        }),
    });
}
