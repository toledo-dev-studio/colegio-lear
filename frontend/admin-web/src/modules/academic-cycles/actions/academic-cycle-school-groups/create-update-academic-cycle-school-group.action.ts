import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupRequest } from "@/interfaces/requests/academic-cycle-school-group.request";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";

interface Options {
    id: string;
    academicCycleSchoolGroupRequestLike: Partial<AcademicCycleSchoolGroupRequest>
}

export const createUpdateAcademicCycleSchoolGroupActionAsync = async ({ id, academicCycleSchoolGroupRequestLike }: Options): Promise<AcademicCycleSchoolGroupResponse> => {
    await sleep();

    const isCreating = id === "new";
    const { academicCycleId } = academicCycleSchoolGroupRequestLike;

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...academicCycleSchoolGroupRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as AcademicCycleSchoolGroupResponse;
    }

    const { data } = await api<AcademicCycleSchoolGroupResponse>({
        url: isCreating ? `/academic-cycles/${academicCycleId}/school-groups` : `/academic-cycles/${academicCycleId}/school-groups/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: { ...academicCycleSchoolGroupRequestLike }
    });

    return {
        ...data,
    };
}
