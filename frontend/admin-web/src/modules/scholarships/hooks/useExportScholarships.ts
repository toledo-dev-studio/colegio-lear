import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getScholarshipsActionAsync } from "../actions/get-scholarships.action";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useExportScholarships = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;
    const discountPercentage = stringToNumberWithDefault(searchParams.get("discount-percentage"), undefined);

    return useMutation({
        mutationFn: () => getScholarshipsActionAsync({
            query,
            name,
            status,
            discountPercentage
        }),
    });
}
