import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";

export const createUpdatePaymentConceptActionAsync = async (paymentConceptLike: Partial<PaymentConcept>): Promise<PaymentConcept> => {
    await sleep();

    const { id } = paymentConceptLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        delete paymentConceptLike.id;
        return {
            id: isCreating ? generateTemporalId() : id,
            ...paymentConceptLike,
        } as PaymentConcept;
    }

    const { data } = await api<PaymentConcept>({
        url: isCreating ? '/payment-concepts' : `/payment-concepts/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: paymentConceptLike
    });

    return data;
}
