import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_WALLET_PAYMENTS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentWalletPaymentsAsync } from "../../api/student-wallet/get-student-wallet-payments.api";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const useGetStudentWalletPayments = ({ academicCycleId, academicCycleEnrollmentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_STUDENT_WALLET_PAYMENTS_QUERY_KEY, { academicCycleId, academicCycleEnrollmentId }],
        queryFn: () => getStudentWalletPaymentsAsync({ academicCycleId, academicCycleEnrollmentId }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
