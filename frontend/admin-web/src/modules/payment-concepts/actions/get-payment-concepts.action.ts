import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";

interface Options {
    query?: string;
    name?: string;
    amount?: number;
    allowForgiveness?: boolean;
    status?: boolean;
}

export const getPaymentConceptsActionAsync = async ({ query = '', name, amount, allowForgiveness, status }: Options): Promise<PaymentConcept[]> => {
    await sleep();

    let endpoint = "payment-concepts";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/payment-concepts/payment-concepts.json";

    const { data } = await api.get<PaymentConcept[]>(endpoint, {
        params: {
            q: query,
            name,
            amount,
            allowForgiveness,
            status
        }
    });

    return data;
}
