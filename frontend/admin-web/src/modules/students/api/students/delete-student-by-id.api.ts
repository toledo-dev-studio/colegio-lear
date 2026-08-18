import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string
}

export const deleteStudentByIdAsync = async ({ id }: Options): Promise<string> => {
    await sleep();

    if (IS_MOCKABLE)
        return id;

    await api.delete(`/students/${id}`);
    
    return id;
}
