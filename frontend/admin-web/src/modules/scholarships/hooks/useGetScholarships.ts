import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getScholarshipsAsync } from "../api/get-scholarships.api";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetScholarships = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;
    const discountPercentage = stringToNumberWithDefault(searchParams.get("discount-percentage"), undefined);

    return useMutation({
        mutationFn: () => getScholarshipsAsync({
            query,
            name,
            isActive,
            discountPercentage
        }),
    });
}
