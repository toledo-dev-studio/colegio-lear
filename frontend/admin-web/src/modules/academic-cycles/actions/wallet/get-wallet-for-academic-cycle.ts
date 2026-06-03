import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";

interface Options {
    academicCycleId: string;
}

export const getWalletForAcademicCycle = async ({ academicCycleId }: Options): Promise<AcademicCycleWallet[]> => {
    await sleep();

    if (!academicCycleId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/academic-cycles/${academicCycleId}/wallet`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/academic-cycles.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/academic-cycles-wallet/academic-cycles-wallet.json";

    const { data } = await api.get<AcademicCycleWallet[]>(endpoint);

    return data;
}
