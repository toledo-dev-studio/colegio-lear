import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";

interface Options {
    query?: string;
    academicCycleId: string;
}

export const getAcademicCycleWalletActionAsync = async ({ query, academicCycleId }: Options): Promise<AcademicCycleWalletItemResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/wallet`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/academic-cycles.json";

    const { data } = await api.get<AcademicCycleWalletItemResponse[]>(endpoint, {
        params: {
            q: query,
        }
    });

    return data;
}
