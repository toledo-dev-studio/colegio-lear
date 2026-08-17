import { useQuery } from "@tanstack/react-query";

import { getStudentWalletAsync } from "../api/get-student-wallet.api";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_WALLET_QUERY_KEY } from "@/lib/queries-key/students-queries-key";


interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const useGetStudentWallet = ({ academicCycleId, academicCycleEnrollmentId }: Options) => {
    return useQuery({
        queryKey: [GET_STUDENT_WALLET_QUERY_KEY, { academicCycleId, academicCycleEnrollmentId }],
        queryFn: () => getStudentWalletAsync({ academicCycleId, academicCycleEnrollmentId }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });
}
