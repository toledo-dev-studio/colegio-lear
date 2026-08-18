import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Options {
    id: string;
}

export const getPaymentConceptByIdAsync = async ({ id }: Options): Promise<PaymentConceptResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<PaymentConceptResponse[]>(`/payment-concepts/payment-concepts.json`);
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error("No se encontró el registro solicitado");
        return response;
    }

    const { data } = await api.get<PaymentConceptResponse>(`/payment-concepts/${id}`);
    return data;
}
