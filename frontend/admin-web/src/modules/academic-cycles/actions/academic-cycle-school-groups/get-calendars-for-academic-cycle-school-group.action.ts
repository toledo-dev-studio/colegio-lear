import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupCalendarResponse } from "@/interfaces/responses/academic-cycle-school-group-calendar.response";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const getCalendarsForAcademicCycleSchoolGroupActionAsync = async ({ academicCycleId, academicCycleSchoolGroupId }: Options): Promise<AcademicCycleSchoolGroupCalendarResponse[]> => {
    await sleep();

    let endpoint = `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/calendars`;

        if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/academic-cycles/school-groups/calendars.json";

    // REMOVE
    endpoint = "http://localhost/api/academic-cycles/school-groups/calendars.json";

    const { data } = await api.get<AcademicCycleSchoolGroupCalendarResponse[]>(endpoint);

    return data;
}
