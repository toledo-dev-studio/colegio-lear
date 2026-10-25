import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentAssistResponse } from "@/interfaces/responses/student-assist.response";
import { toDayParam } from "../../lib/attendance.lib";

interface Options {
    academicCycleId: string;
    schoolGroupId: string;
    assistDate: string;
}

export const getSchoolGroupAssistsAsync = async ({ academicCycleId, schoolGroupId, assistDate }: Options): Promise<StudentAssistResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<StudentAssistResponse[]>("/my-classes/school-group-assists.json");
        return data.filter((assist) => toDayParam(assist.assistDate) === toDayParam(assistDate));
    }

    const { data } = await api.get<StudentAssistResponse[]>(
        `/academic-cycles/${academicCycleId}/school-groups/${schoolGroupId}/assists`,
        {
            params: {
                assistDate,
            }
        }
    );

    return data;
}