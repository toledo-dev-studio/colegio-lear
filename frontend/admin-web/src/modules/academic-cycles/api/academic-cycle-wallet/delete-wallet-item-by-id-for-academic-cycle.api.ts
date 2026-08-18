import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    academicCycleId: string;
}

export const deleteAcademicCycleWalletItemByIdAsync = async ({ academicCycleId, id }: Options): Promise<Options> => {
    await sleep();

    if (IS_MOCKABLE)
        return { academicCycleId, id };

    await api.delete(`/academic-cycles/${academicCycleId}/wallet/${id}`);
    return { academicCycleId, id };
}
