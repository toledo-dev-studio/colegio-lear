import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getAcademicCycleWalletActionAsync } from "../../actions/academic-cycle-wallet/get-academic-cycle-wallet.action";

interface Options {
    academicCycleId: string;
}

export const useGetAcademicCycleWallet = ({ academicCycleId }: Options) => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    const queryResult = useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_WALLET_QUERY_KEY, { academicCycleId, query }],
        queryFn: () => getAcademicCycleWalletActionAsync({ academicCycleId, query }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
