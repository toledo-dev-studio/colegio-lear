import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicLevelRequest } from "@/interfaces/requests/academic-level.request";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";

interface Options {
    id: string;
    academicLevelRequestLike: Partial<AcademicLevelRequest>;
}

export const createUpdateAcademicLevelAsync = async ({ id, academicLevelRequestLike }: Options): Promise<AcademicLevelResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
        return {
            ...academicLevelRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as AcademicLevelResponse;
    }

    const { data } = await api<AcademicLevelResponse>({
        url: isCreating ? "/academic-levels" : `/academic-levels/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: academicLevelRequestLike
    });

    return {
        ...data,
    };
}
