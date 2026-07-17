import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PaymentConceptRequest } from "@/interfaces/requests/payment-concept.request";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Options {
    id: string;
    paymentConceptRequestLike: Partial<PaymentConceptRequest>;
}

export const createUpdatePaymentConceptActionAsync = async ({ id, paymentConceptRequestLike }: Options): Promise<PaymentConceptResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...paymentConceptRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as PaymentConceptResponse;
    }

    const { data } = await api<PaymentConceptResponse>({
        url: isCreating ? '/payment-concepts' : `/payment-concepts/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: paymentConceptRequestLike
    });

    return data;
}
