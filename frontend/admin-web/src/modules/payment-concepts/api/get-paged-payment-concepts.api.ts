import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { PaymentConceptFilter } from "@/interfaces/filters/payment-concept.filter";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Options extends PaymentConceptFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedPaymentConceptsAsync = async (props: Options): Promise<PagedResponse<PaymentConceptResponse>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, name, amount, allowForgiveness, isActive } = props;

    let endpoint = "payment-concepts/paged";

    if (IS_MOCKABLE)
        endpoint = "/payment-concepts/paged-payment-concepts.json";

    const { data } = await api.get<PagedResponse<PaymentConceptResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            allowForgiveness,
            amount,
            isActive,
        }
    });

    return {
        ...data
    };
}
