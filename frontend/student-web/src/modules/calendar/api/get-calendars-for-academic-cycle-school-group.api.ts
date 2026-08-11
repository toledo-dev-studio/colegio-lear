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

    if (IS_MOCKABLE) {
        const { data } = await api.get<AcademicCycleSchoolGroupCalendarResponse[]>("/calendar/calendars.json");
        return data;
    }

    const { data } = await api.get<AcademicCycleSchoolGroupCalendarResponse[]>(`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/calendars`);

    return data;
}
