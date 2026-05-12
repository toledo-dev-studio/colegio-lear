import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";


export const createUpdatePaymentConceptActionAsync = async (paymentConceptLike: Partial<PaymentConcept>): Promise<PaymentConcept> => {
    await sleep(500);

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
