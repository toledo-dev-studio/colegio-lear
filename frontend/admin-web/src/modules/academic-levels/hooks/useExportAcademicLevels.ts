import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { isValidBooleanString, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAcademicLevelsActionAsync } from "../actions/get-academic-levels.action";

export const useExportAcademicLevels = () => {
    const [searchParams] = useSearchParams();

    // Main query params
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query params
    const name = searchParams.get("name")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    return useMutation({
        mutationFn: () => getAcademicLevelsActionAsync({
            query,
            name,
            status
        }),
    });
}
