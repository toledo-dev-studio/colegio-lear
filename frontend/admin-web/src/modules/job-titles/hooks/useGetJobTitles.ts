import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getJobTitlesAsync } from "../api/get-job-titles.api";
import type { JobTitleTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

export const useGetJobTitles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const jobTitleType = isValidValueWithDefault(searchParams.get("job-title-type")?.trim() as JobTitleTypeKey, undefined);
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    return useMutation({
        mutationFn: () => getJobTitlesAsync({
            query,
            name,
            jobTitleType,
            isActive
        }),
    });
}
