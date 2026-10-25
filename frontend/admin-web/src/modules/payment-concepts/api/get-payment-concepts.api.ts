import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PaymentConceptFilter } from "@/interfaces/filters/payment-concept.filter";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Options extends PaymentConceptFilter {
    query?: string;
}

export const getPaymentConceptsAsync = async ({ query, name, amount, allowForgiveness, isActive }: Options): Promise<PaymentConceptResponse[]> => {
    await sleep();

    let endpoint = "payment-concepts";

    if (IS_MOCKABLE)
        endpoint = "/payment-concepts/payment-concepts.json";

    const { data } = await api.get<PaymentConceptResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            amount,
            allowForgiveness,
            isActive
        }
    });

    return data;
}
