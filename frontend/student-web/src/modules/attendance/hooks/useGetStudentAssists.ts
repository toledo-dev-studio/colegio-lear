import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getStudentAssistsAsync } from "../api/get-student-assists.api";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_ASSISTS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import type { StudentAssistResponse } from "@/interfaces/responses/student-assist.response";
import { isValidValueWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { getCurrentWeekRange } from "../lib/attendance.lib";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

const EMPTY_PAGED_RESPONSE: PagedResponse<StudentAssistResponse> = {
    data: [],
    totalPages: 1,
    currentPage: 1,
    itemsCount: 0,
};

export const useGetStudentAssists = ({ academicCycleId, academicCycleEnrollmentId }: Options) => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const defaultRange = getCurrentWeekRange();
    const fromDate = isValidValueWithDefault(searchParams.get("from-date")?.trim(), defaultRange.from);
    const toDate = isValidValueWithDefault(searchParams.get("to-date")?.trim(), defaultRange.to);

    const queryResult = useQuery({
        queryKey: [GET_STUDENT_ASSISTS_QUERY_KEY, { academicCycleId, academicCycleEnrollmentId, page, pageSize, fromDate, toDate }],
        queryFn: () => getStudentAssistsAsync({ academicCycleId, academicCycleEnrollmentId, page, pageSize, fromDate, toDate }),
        staleTime: FIVE_MINUTES_STALE_TIME,
        enabled: !!academicCycleId && !!academicCycleEnrollmentId,
    });

    return {
        ...queryResult,
        data: queryResult.data ?? EMPTY_PAGED_RESPONSE,
    }
}
