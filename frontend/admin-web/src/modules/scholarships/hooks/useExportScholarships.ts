import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getScholarshipsActionAsync } from "../actions/get-scholarships.action";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useExportScholarships = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const discountPercentage = stringToNumberWithDefault(searchParams.get('discount-percentage'));

    return useMutation({
        mutationFn: () => getScholarshipsActionAsync({
            query,
            name,
            status,
            discountPercentage
        }),
    });
}
