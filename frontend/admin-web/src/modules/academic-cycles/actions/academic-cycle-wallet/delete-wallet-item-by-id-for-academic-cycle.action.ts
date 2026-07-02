import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    academicCycleId: string;
}

export const deleteAcademicCycleWalletItemByIdActionAsync = async ({ academicCycleId, id }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { academicCycleId, id };

    await api.delete(`/academic-cycles/${academicCycleId}/wallet/${id}`);
    return { academicCycleId, id };
}
