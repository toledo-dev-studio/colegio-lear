import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    amount?: number;
    allowForgiveness?: boolean; 
    status?: boolean;
}

export const getPagedPaymentConceptsActionAsync = async (props: Options): Promise<PagedResponse<PaymentConcept>> => {
    await sleep();

    const { query = '', page = 1, pageSize = 1, name, amount, allowForgiveness, status } = props;

    const { data } = await api.get<PagedResponse<PaymentConcept>>('/payment-concepts/paged-payment-concepts.json', {
        params: {
            q: query,
            page,
            pageSize,
            name,
            allowForgiveness,
            amount,
            status,
        }
    });

    return {
        ...data
    };
}
