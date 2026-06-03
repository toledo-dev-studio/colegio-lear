import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycle } from "@/interfaces/entites/academic-cycle";
import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/types/KeyValuePair";

interface Options {
    query?: string;
    name?: string;
    code?: string;
    startDate?: string;
    endDate?: string;
    type?: AcademicPeriodTypeKey;
    enrollmentOpen?: boolean;
    status?: AcademicCycleStatusKey;
}

export const getAcademicCyclesActionAsync = async ({ query, name, code, startDate, endDate, type, enrollmentOpen, status }: Options): Promise<AcademicCycle[]> => {
    await sleep();

    let endpoint = "/academic-cycles";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/academic-cycles.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/academic-cycles/academic-cycles.json";

    const { data } = await api.get<AcademicCycle[]>(endpoint, {
        params: {
            q: query,
            name,
            code,
            startDate,
            endDate,
            type,
            enrollmentOpen,
            status,
        }
    });

    return data;
}
