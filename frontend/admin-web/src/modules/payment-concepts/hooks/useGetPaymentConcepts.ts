import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getPaymentConceptsAsync } from "../api/get-payment-concepts.api";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPaymentConcepts = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const amount = stringToNumberWithDefault(searchParams.get("amount"), undefined);
    const allowForgiveness = isValidBooleanString(searchParams.get("allowForgiveness")) ? stringToBooleanWithDefault(searchParams.get("allowForgiveness")) : undefined;
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    return useMutation({
        mutationFn: () => getPaymentConceptsAsync({
            query,
            name,
            amount,
            allowForgiveness,
            isActive
        }),
    });
}
