import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";

export const getPaymentConceptByIdActionAsync = async (id?: string): Promise<PaymentConcept> => {
    if (!id)
        throw new Error('Id del registro es requerido');

    if (id === "new") {
        return {
            id: undefined,
            name: "",
            description: "",
            allowForgiveness: false,
            amount: 1,
            status: true,
        } as unknown as PaymentConcept;
    }

    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<PaymentConcept[]>(`/payment-concepts/payment-concepts.json`);
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error('No fue posible identificar el registro solicitado');
        return response;
    }

    const { data } = await api.get<PaymentConcept>(`/payment-concepts/${id}`);
    return data;
}
