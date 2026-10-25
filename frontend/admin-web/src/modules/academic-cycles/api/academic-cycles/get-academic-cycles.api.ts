import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleFilter } from "@/interfaces/filters/academic-cycle.filter";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

interface Options extends AcademicCycleFilter {
    query?: string;
}

export const getAcademicCyclesAsync = async (options: Options): Promise<AcademicCycleResponse[]> => {
    await sleep();

    const { query, name, code, startDate, endDate, periodType, status, enrollmentOpen, academicLevelId, educationLevelId } = options;

    let endpoint = "/academic-cycles";

    if (IS_MOCKABLE)
        endpoint = "/academic-cycles/academic-cycles/academic-cycles.json";

    const { data } = await api.get<AcademicCycleResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            code,
            startDate,
            endDate,
            periodType,
            status,
            enrollmentOpen,
            academicLevelId,
            educationLevelId
        }
    });

    return data;
}
