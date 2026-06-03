import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycle } from "@/interfaces/entites/academic-cycle";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/types/KeyValuePair";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    code?: string;
    startDate?: string;
    endDate?: string;
    type?: AcademicPeriodTypeKey;
    enrollmentOpen?: boolean;
    status?: AcademicCycleStatusKey;
}

export const getPagedAcademicCyclesActionAsync = async ({ query, page = 1, pageSize = 1, name, code, startDate, endDate, type, enrollmentOpen, status }: Options): Promise<PagedResponse<AcademicCycle>> => {
    await sleep();

    let endpoint = "/academic-cycles/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/paged-academic-cycles.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/academic-cycles/paged-academic-cycles.json";

    const { data } = await api.get<PagedResponse<AcademicCycle>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            code,
            startDate,
            endDate,
            type,
            enrollmentOpen,
            status,
        }
    });

    return {
        ...data
    };
}
