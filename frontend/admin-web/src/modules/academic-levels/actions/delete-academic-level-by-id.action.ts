import { api } from "@/api/client";
import { sleep } from "@/lib/utils";

interface Options {
    id?: string
}

export const deleteAcademicLevelByIdActionAsync = async ({ id }: Options): Promise<void> => {
    if(!id) 
        return;
    await sleep();
    await api.delete(`/academic-levels/${id}`);
    return;
}
