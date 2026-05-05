import { api } from "@/api/client";
import { sleep } from "@/lib/utils";

interface Options {
    id?: string
}

export const deleteEmployeeByIdActionAsync = async ({ id }: Options): Promise<void> => {
    if(!id) 
        return;
    await sleep();
    await api.delete(`/employees/${id}`);
    return;
}
