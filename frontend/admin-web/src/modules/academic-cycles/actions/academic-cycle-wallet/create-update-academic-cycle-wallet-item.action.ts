import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleWalletItemRequest } from "@/interfaces/requests/academic-cycle-wallet-item.request";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";

interface Options {
    id: string;
    academicCycleWalletItemRequestLike: Partial<AcademicCycleWalletItemRequest>
}

export const createUpdateAcademicCycleWalletItemActionAsync = async ({ id, academicCycleWalletItemRequestLike }: Options): Promise<AcademicCycleWalletItemResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...academicCycleWalletItemRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as AcademicCycleWalletItemResponse;
    }

    const { data } = await api<AcademicCycleWalletItemResponse>({
        url: isCreating ? `/academic-cycles/${academicCycleWalletItemRequestLike.academicCycleId}/wallet` : `/academic-cycles/${academicCycleWalletItemRequestLike.academicCycleId}/wallet/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: { ...academicCycleWalletItemRequestLike }
    });

    return {
        ...data,
    };
}
