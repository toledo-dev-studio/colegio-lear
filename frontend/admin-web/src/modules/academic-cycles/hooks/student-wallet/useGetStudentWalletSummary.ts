import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_WALLET_SUMMARY_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentWalletSummaryActionAsync } from "../../actions/student-wallet/get-student-wallet-summary.action";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const useGetStudentWalletSummary = ({ academicCycleId, academicCycleEnrollmentId }: Options) => {
    return useQuery({
        queryKey: [GET_STUDENT_WALLET_SUMMARY_QUERY_KEY, { academicCycleId, academicCycleEnrollmentId }],
        queryFn: () => getStudentWalletSummaryActionAsync({ academicCycleId, academicCycleEnrollmentId }),
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
