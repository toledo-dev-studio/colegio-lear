import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";

interface Options {
    academicCycleWalletLike: Partial<AcademicCycleWallet>
}

export const createUpdateWalletForAcademicCycleActionAsync = async ({ academicCycleWalletLike }: Options): Promise<AcademicCycleWallet> => {
    await sleep();

    const { id, academicCycleId } = academicCycleWalletLike;
    const isCreating = id === undefined;
    
    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        academicCycleWalletLike.id = isCreating ? generateTemporalId() : id;
        return academicCycleWalletLike as AcademicCycleWallet;
    }

    const { data } = await api<AcademicCycleWallet>({
        url: isCreating ? `/academic-cycles/${academicCycleId}/wallet` : `/academic-cycles/${academicCycleId}/wallet/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: { ...academicCycleWalletLike }
    });

    return {
        ...data,
    };
}
