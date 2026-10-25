import { useQuery } from "@tanstack/react-query"

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { DASHBOARD_ANNOUNCEMENTS_SUMMARY } from "@/lib/queries-key/dashboard-queries-key";
import { getAnnouncementsSummaryAsync } from "../api/get-announcements-summary.api";

export const useGetAnnouncementsSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_ANNOUNCEMENTS_SUMMARY],
    queryFn: getAnnouncementsSummaryAsync,
    staleTime: FIVE_MINUTES_STALE_TIME
  });
}
