import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getLatestTeachersSummaryAsync } from "../api/get-latest-teachers-summary.api";

export const useGetLatestTeachersSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_TEACHERS_EMPLOYEES_SUMMARY],
    queryFn: getLatestTeachersSummaryAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
