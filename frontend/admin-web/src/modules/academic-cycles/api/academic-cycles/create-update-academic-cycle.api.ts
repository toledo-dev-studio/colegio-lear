import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleRequest } from "@/interfaces/requests/academic-cycle.request";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";

interface Options {
    id: string;
    academicCycleRequestLike: Partial<AcademicCycleRequest>;
}

export const createUpdateAcademicCycleAsync = async ({ id, academicCycleRequestLike }: Options): Promise<AcademicCycleResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
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
