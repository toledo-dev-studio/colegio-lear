import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    academicCycleId: string;
    academicCycleWalletId: string;
}

export const deleteWalletByIdForAcademicCycleActionAsync = async ({ academicCycleId, academicCycleWalletId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { academicCycleId, academicCycleWalletId };

    await api.delete(`/academic-cycles/${academicCycleId}/wallet/${academicCycleWalletId}`);
    return { academicCycleId, academicCycleWalletId };
}
