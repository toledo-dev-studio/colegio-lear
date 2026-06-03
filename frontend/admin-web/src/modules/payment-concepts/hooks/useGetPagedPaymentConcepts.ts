import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedPaymentConceptsActionAsync } from "../actions/get-paged-payment-concepts.action";
import { GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedPaymentConcepts = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const amount = stringToNumberWithDefault(searchParams.get("amount")?.trim(), undefined);
    const allowForgiveness = isValidBooleanString(searchParams.get("allowForgiveness")) ? stringToBooleanWithDefault(searchParams.get("allowForgiveness")) : undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY, { query, page, pageSize, name, amount, allowForgiveness, status, }],
        queryFn: () => getPagedPaymentConceptsActionAsync({
            query,
            page,
            pageSize,
            name,
            amount,
            allowForgiveness,
            status,
        }),
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
