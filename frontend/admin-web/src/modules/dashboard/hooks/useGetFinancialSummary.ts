import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_FINANCIAL_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getFinancialSummaryActionAsync } from "../actions/get-financial-summary.action";

export const useGetFinancialSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_FINANCIAL_SUMMARY],
    queryFn: getFinancialSummaryActionAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
