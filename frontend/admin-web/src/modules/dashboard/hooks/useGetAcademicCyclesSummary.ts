import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_ACADEMIC_CYCLES_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getAcademicCyclesSummaryActionAsync } from "../actions/get-academic-cylces-summary.action";

export const useGetAcademicCyclesSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_ACADEMIC_CYCLES_SUMMARY],
    queryFn: getAcademicCyclesSummaryActionAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
