import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";

export const getPaymentConceptByIdActionAsync = async (id: string): Promise<PaymentConcept> => {
    if (!id)
        throw new Error('Id del registro es requerido');

    if(id === "new") {
        return {
            id: "new",
            name: "",
            description: "",
            allowForgiveness: false,
            amount: 1,
            status: true,
        }
    }

    await sleep();

    // const { data } = await api.get<PaymentConcept>(`/payment-concepts/${id}.json`);

    const { data } = await api.get<PaymentConcept[]>(`/payment-concepts/payment-concepts.json`);
        
        // DELETE THIS LOGIC
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error('No fue posible identificar el registro solicitado');
        // DELETE THIS LOGIC

    return {
        ...response
    };
}
