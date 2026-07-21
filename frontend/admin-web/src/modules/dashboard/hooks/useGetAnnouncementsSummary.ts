import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_ANNOUNCEMENTS_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getAnnouncementsSummaryActionAsync } from "../actions/get-announcements-summary.action";

export const useGetAnnouncementsSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_ANNOUNCEMENTS_SUMMARY],
    queryFn: getAnnouncementsSummaryActionAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
