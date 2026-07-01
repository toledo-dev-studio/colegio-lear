import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_WALLET_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentWalletActionAsync } from "../../actions/student-wallet/get-student-wallet.action";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const useGetStudentWallet = ({ academicCycleId, academicCycleEnrollmentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_STUDENT_WALLET_QUERY_KEY, { academicCycleId, academicCycleEnrollmentId }],
        queryFn: () => getStudentWalletActionAsync({ academicCycleId, academicCycleEnrollmentId }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data ?? [],
    }
}
