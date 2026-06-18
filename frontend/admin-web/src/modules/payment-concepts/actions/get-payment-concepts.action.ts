import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PaymentConceptFilter } from "@/interfaces/filters/payment-concept.filter";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Options extends PaymentConceptFilter {
    query?: string;
}

export const getPaymentConceptsActionAsync = async ({ query, name, amount, allowForgiveness, isActive }: Options): Promise<PaymentConceptResponse[]> => {
    await sleep();

    let endpoint = "payment-concepts";

    if (VITE_ENVIRONMENT === "mockable")
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
