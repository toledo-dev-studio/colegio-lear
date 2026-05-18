import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id?: string
}

export const deleteEmployeeByIdActionAsync = async ({ id }: Options): Promise<void> => {
    if (!id)
        return;

    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return;

    await api.delete(`/employees/${id}`);
    return;
}
