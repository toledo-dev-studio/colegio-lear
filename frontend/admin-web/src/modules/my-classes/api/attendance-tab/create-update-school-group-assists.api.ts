import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AssistStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { StudentAssistResponse } from "@/interfaces/responses/student-assist.response";

export interface CreateUpdateSchoolGroupAssistInput {
    academicCycleEnrollmentId: string;
    status: AssistStatusKey;
    absenceReason?: string | null;
}

interface Options {
    academicCycleId: string;
    schoolGroupId: string;
    assistDate: string;
    assists: CreateUpdateSchoolGroupAssistInput[];
}

export const createUpdateSchoolGroupAssistsAsync = async ({ academicCycleId, schoolGroupId, assistDate, assists }: Options): Promise<StudentAssistResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        return assists.map((assist) => ({
            id: generateTemporalId(),
            academicCycleEnrollmentId: assist.academicCycleEnrollmentId,
            assistDate,
            status: assist.status,
            absenceReason: assist.absenceReason ?? null,
        }));
    }

    const { data } = await api.post<StudentAssistResponse[]>(
        `/academic-cycles/${academicCycleId}/school-groups/${schoolGroupId}/assists`,
        {
            assistDate,
            assists,
        }
    );

    return data;
}