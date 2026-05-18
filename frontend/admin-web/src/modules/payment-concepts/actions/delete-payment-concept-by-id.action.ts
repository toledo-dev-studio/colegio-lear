import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";

interface Options {
    id?: string
}

export const deletePaymentConceptByIdActionAsync = async ({ id }: Options): Promise<void> => {
    if(!id) 
        return;
    await sleep();
    await api.delete(`/payment-concepts/${id}`);
    return;
}
