import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { getAcademicLevelsActionAsync } from "../actions/get-academic-levels.action";
import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_ACADEMIC_LEVELS_QUERY_KEY } from "../lib/queries-key";

export const useExportAcademicLevels = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_ACADEMIC_LEVELS_QUERY_KEY, { query }],
        queryFn: () => getAcademicLevelsActionAsync({
            query,
            status
        }),
        enabled: false,
    });
}
