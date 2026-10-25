import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getTeacherEmployeesSummaryAsync } from "../api/get-teacher-employees-summary.api";

export const useGetTeachersEmployeesSummary = () => {
    const queryResult = useQuery({
        queryKey: [DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY],
        queryFn: getTeacherEmployeesSummaryAsync,
        staleTime: FIVE_MINUTES_STALE_TIME
    });
    
    return {
        ...queryResult,
        data: queryResult.data ?? [],
    }
}
