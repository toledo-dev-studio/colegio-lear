import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getAcademicLevelsActionAsync } from "../../actions/academic-levels/get-academic-levels.action";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

export const useGetAcademicLevels = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    return useMutation({
        mutationFn: () => getAcademicLevelsActionAsync({
            query,
            name,
            isActive
        }),
    });
}
