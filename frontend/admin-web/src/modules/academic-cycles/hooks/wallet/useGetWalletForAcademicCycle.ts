import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getWalletForAcademicCycleActionAsync } from "../../actions/wallet/get-wallet-for-academic-cycle";

export const useGetWalletForAcademicCycle = (academicCycleId: string) => {
    const query = useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId: academicCycleId }],
        queryFn: () => getWalletForAcademicCycleActionAsync({ academicCycleId }),
    });

    return {
        ...query,
        data: query.data ?? []
    }
}
