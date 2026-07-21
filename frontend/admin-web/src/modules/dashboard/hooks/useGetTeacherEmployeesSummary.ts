import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getTeacherEmployeesSummaryActionAsync } from "../actions/get-teacher-employees-summary.action";

export const useGetTeachersEmployeesSummary = () => {
    const queryResult = useQuery({
        queryKey: [DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY],
        queryFn: getTeacherEmployeesSummaryActionAsync,
        staleTime: FIVE_MINUTES_STALE_TIME
    });
    
    return {
        ...queryResult,
        data: queryResult.data ?? [],
    }
}
