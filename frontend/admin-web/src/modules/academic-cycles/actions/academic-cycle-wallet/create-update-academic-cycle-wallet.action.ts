import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleWalletRequest } from "@/interfaces/requests/academic-cycle-wallet.request";
import type { AcademicCycleWalletResponse } from "@/interfaces/responses/academic-cycle-wallet.response";

interface Options {
    id: string;
    academicCycleWalletRequestLike: Partial<AcademicCycleWalletRequest>
}

export const createUpdateAcademicCycleWalletActionAsync = async ({ id, academicCycleWalletRequestLike }: Options): Promise<AcademicCycleWalletResponse> => {
    await sleep();

    const isCreating = id === "new";

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        return {
            ...academicCycleWalletRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as AcademicCycleWalletResponse;
    }

    const { data } = await api<AcademicCycleWalletResponse>({
        url: isCreating ? `/academic-cycles/${academicCycleWalletRequestLike.academicCycleId}/wallet` : `/academic-cycles/${academicCycleWalletRequestLike.academicCycleId}/wallet/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: { ...academicCycleWalletRequestLike }
    });

    return {
        ...data,
    };
}
