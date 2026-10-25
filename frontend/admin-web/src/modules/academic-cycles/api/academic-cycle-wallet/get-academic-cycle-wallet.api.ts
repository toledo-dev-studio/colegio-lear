import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";

interface Options {
    query?: string;
    academicCycleId: string;
}

export const getAcademicCycleWalletAsync = async ({ query, academicCycleId }: Options): Promise<AcademicCycleWalletItemResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/wallet`;

    if (IS_MOCKABLE)
        endpoint = "/academic-cycles/academic-cycles-wallet/academic-cycles-wallet.json";

    const { data } = await api.get<AcademicCycleWalletItemResponse[]>(endpoint, {
        params: {
            q: query,
        }
    });

    return data;
}
