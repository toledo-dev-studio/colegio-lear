import { api } from "@/api/client";
import { sleep } from "@/lib/utils";

interface Options {
    id?: string
}

export const deleteJobTitleByIdActionAsync = async ({ id }: Options): Promise<void> => {
    if(!id) 
        return;
    await sleep();
    await api.delete(`/job-titles/${id}`);
    return;
}
