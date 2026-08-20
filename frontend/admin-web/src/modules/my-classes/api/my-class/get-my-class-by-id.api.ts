import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { MyClassResponse } from "@/interfaces/responses/my-class.response";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    id: string;
}

export const getMyClassByIdAsync = async ({ id }: Options): Promise<MyClassResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<PagedResponse<MyClassResponse>>("/my-classes/paged-my-classes.json");
        const record = data.data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<MyClassResponse>(`/me/school-groups/${id}`);

    return data;
}