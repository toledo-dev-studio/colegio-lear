import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";

interface Options {
    id?: string
}

export const deleteScholarshipByIdActionAsync = async ({ id }: Options): Promise<void> => {
    if(!id) 
        return;
    await sleep();
    await api.delete(`/scholarships/${id}`);
    return;
}
