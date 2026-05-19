import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getPaymentConceptsActionAsync } from "../actions/get-payment-concepts.action";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useExportPaymentConcepts = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const amount = searchParams.get('amount')?.trim() || '';
    const allowForgiveness = stringToBooleanWithDefault(searchParams.get('allowForgiveness'));
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useMutation({
        mutationFn: () => getPaymentConceptsActionAsync({
            query,
            name,
            amount: stringToNumberWithDefault(amount, undefined),
            allowForgiveness,
            status
        }),
    });
}
