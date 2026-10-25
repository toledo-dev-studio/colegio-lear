import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupCalendarResponse } from "@/interfaces/responses/academic-cycle-school-group-calendar.response";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const getCalendarsForAcademicCycleSchoolGroupAsync = async ({ academicCycleId, academicCycleSchoolGroupId }: Options): Promise<AcademicCycleSchoolGroupCalendarResponse[]> => {
    await sleep();

    const endpoint = `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/calendars`;

    if (IS_MOCKABLE) {
        const { data } = await api.get<AcademicCycleSchoolGroupCalendarResponse[]>("/academic-cycles/school-groups/calendars.json");
        return data.filter(calendar => calendar.academicCycleSchoolGroupId === academicCycleSchoolGroupId);
    }

    const { data } = await api.get<AcademicCycleSchoolGroupCalendarResponse[]>(endpoint);

    return data;
}
