import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getLatestTeachersSummaryActionAsync } from "../actions/get-latest-teachers-summary.action";

export const useGetLatestTeachersSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY],
    queryFn: getLatestTeachersSummaryActionAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
