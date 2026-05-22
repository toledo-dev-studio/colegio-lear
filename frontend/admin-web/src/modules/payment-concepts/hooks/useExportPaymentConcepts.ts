import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getPaymentConceptsActionAsync } from "../actions/get-payment-concepts.action";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useExportPaymentConcepts = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const amount = stringToNumberWithDefault(searchParams.get("amount")?.trim(), undefined);
    const allowForgiveness = isValidBooleanString(searchParams.get("allowForgiveness")) ? stringToBooleanWithDefault(searchParams.get("allowForgiveness")) : undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    return useMutation({
        mutationFn: () => getPaymentConceptsActionAsync({
            query,
            name,
            amount,
            allowForgiveness,
            status
        }),
    });
}
