import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
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

    const { data } = await api.get<PaymentConcept[]>('/payment-concepts/payment-concepts.json', {
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
