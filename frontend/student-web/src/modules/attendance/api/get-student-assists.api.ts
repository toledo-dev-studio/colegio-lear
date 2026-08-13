import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { toDayParam } from "../lib/attendance.lib";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { StudentAssistFilter } from "@/interfaces/filter/student-assist.filter";
import type { StudentAssistResponse } from "@/interfaces/responses/student-assist.response";

export const STUDENT_ASSISTS_PAGE_SIZE = 10;

interface Options extends StudentAssistFilter {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
    page: number;
    pageSize?: number;
}

export const getStudentAssistsAsync = async ({
    academicCycleId,
    academicCycleEnrollmentId,
    page,
    pageSize = STUDENT_ASSISTS_PAGE_SIZE,
    fromDate,
    toDate,
}: Options): Promise<PagedResponse<StudentAssistResponse>> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<StudentAssistResponse[]>("/attendance/assists.json");

        // El backend devuelve los registros del más reciente al más viejo, filtrados
        // por inscripción y por el rango de fechas (inclusive)
        const fromDay = toDayParam(fromDate);
        const toDay = toDayParam(toDate);

        const assists = data
            .filter((assist) => assist.academicCycleEnrollmentId === academicCycleEnrollmentId)
            .filter((assist) => !fromDay || toDayParam(assist.assistDate)! >= fromDay)
            .filter((assist) => !toDay || toDayParam(assist.assistDate)! <= toDay)
            .sort((a, b) => new Date(b.assistDate).getTime() - new Date(a.assistDate).getTime());

        const totalPages = Math.max(1, Math.ceil(assists.length / pageSize));
        const requestedPage = Math.min(page, totalPages);
        const start = (requestedPage - 1) * pageSize;
        const pagedAssists = assists.slice(start, start + pageSize);

        return {
            data: pagedAssists,
            totalPages,
            currentPage: requestedPage,
            itemsCount: pagedAssists.length,
        };
    }

    const { data } = await api.get<PagedResponse<StudentAssistResponse>>(
        `/academic-cycles/${academicCycleId}/enrollments/${academicCycleEnrollmentId}/assists`,
        {
            params: {
                page,
                pageSize,
                fromDate,
                toDate,
            },
        },
    );

    return data;
}
