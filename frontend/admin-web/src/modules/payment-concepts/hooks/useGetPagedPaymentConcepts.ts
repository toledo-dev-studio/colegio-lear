import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedPaymentConceptsActionAsync } from "../actions/get-paged-payment-concepts.action";
import { GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY } from "@/lib/queries-key/payment-concepts-queries-key";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedPaymentConcepts = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const amount = stringToNumberWithDefault(searchParams.get("amount"), undefined);
    const allowForgiveness = isValidBooleanString(searchParams.get("allow-forgiveness")) ? stringToBooleanWithDefault(searchParams.get("allow-forgiveness")) : undefined;
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_PAYMENT_CONCEPTS_QUERY_KEY, { query, page, pageSize, name, amount, allowForgiveness, isActive, }],
        queryFn: () => getPagedPaymentConceptsActionAsync({
            query,
            page,
            pageSize,
            name,
            amount,
            allowForgiveness,
            isActive,
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
