import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_ACADEMIC_CYCLES_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getAcademicCyclesSummaryAsync } from "../api/get-academic-cylces-summary.api";

export const useGetAcademicCyclesSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_ACADEMIC_CYCLES_SUMMARY],
    queryFn: getAcademicCyclesSummaryAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
