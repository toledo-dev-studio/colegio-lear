import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_SYSTEM_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getSystemSummaryActionAsync } from "../actions/get-system-summary.action";

export const useGetSystemSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_SYSTEM_SUMMARY],
    queryFn: getSystemSummaryActionAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
