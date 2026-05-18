import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";

export const createUpdatePaymentConceptActionAsync = async (paymentConceptLike: Partial<PaymentConcept>): Promise<PaymentConcept> => {
    await sleep();

    const { id } = paymentConceptLike;

    const isCreating = id === "new";

    const { data } = await api<PaymentConcept>({
        url: isCreating ? '/payment-concepts' : `/payment-concepts/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: paymentConceptLike
    });

    return {
        ...data,
    };
}
