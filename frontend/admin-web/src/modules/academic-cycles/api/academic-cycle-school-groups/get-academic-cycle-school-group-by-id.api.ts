import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import type { AcademicCycleSchoolGroupCalendarResponse } from "@/interfaces/responses/academic-cycle-school-group-calendar.response";

interface Options {
    id: string;
    academicCycleId: string;
}

export const getAcademicCycleSchoolGroupByIdAsync = async ({ id, academicCycleId }: Options): Promise<AcademicCycleSchoolGroupResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AcademicCycleSchoolGroupResponse[]>("/academic-cycles/school-groups/school-groups.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        const { data: calendars } = await api.get<AcademicCycleSchoolGroupCalendarResponse[]>("/academic-cycles/school-groups/calendars.json");
        record.calendars = calendars.filter(calendar => calendar.academicCycleSchoolGroupId === id);
        return record;
    }

    const { data } = await api.get<AcademicCycleSchoolGroupResponse>(`/academic-cycles/${academicCycleId}/school-groups/${id}`);

    return data;
}
