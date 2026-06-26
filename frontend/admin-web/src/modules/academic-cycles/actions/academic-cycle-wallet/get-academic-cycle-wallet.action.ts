import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleWalletResponse } from "@/interfaces/responses/academic-cycle-wallet.response";

interface Options {
    query?: string;
    academicCycleId: string;
}

export const getAcademicCycleWalletActionAsync = async ({ query, academicCycleId }: Options): Promise<AcademicCycleWalletResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/wallet`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/academic-cycles.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/academic-cycles-wallet/academic-cycles-wallet.json";

    const { data } = await api.get<AcademicCycleWalletResponse[]>(endpoint, {
        params: {
            q: query,
        }
    });

    return data;
}
