import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleRequest } from "@/interfaces/requests/academic-cycle.request";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

interface Options {
    id: string;
    academicCycleRequestLike: Partial<AcademicCycleRequest>;
}

export const createUpdateAcademicCycleActionAsync = async ({ id, academicCycleRequestLike }: Options): Promise<AcademicCycleResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...academicCycleRequestLike,
            id: isCreating ? generateTemporalId() : id
        } as AcademicCycleResponse;
    }

    const { data } = await api<AcademicCycleResponse>({
        url: isCreating ? "/academic-cycles" : `/academic-cycles/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: {
            ...academicCycleRequestLike
        }
    });

    return {
        ...data,
    };
}
