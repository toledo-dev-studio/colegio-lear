import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { isValidBooleanString, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getJobTitlesActionAsync } from "../actions/get-job-titles.action";
import type { JobTitleTypes } from "@/interfaces/entites/job-title.interface";

export const useExportJobTitles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const jobTitleType = (searchParams.get("job-title-type")?.trim() as JobTitleTypes) || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    return useMutation({
        mutationFn: () => getJobTitlesActionAsync({
            query,
            name,
            jobTitleType,
            status
        }),
    });
}
