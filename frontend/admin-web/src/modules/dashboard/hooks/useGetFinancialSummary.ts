import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_FINANCIAL_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getFinancialSummaryAsync } from "../api/get-financial-summary.api";

export const useGetFinancialSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_FINANCIAL_SUMMARY],
    queryFn: getFinancialSummaryAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
