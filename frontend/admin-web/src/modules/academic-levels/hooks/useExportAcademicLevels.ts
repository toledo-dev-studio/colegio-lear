import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { GET_ACADEMIC_LEVELS_QUERY_KEY } from "../lib/queries-key";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAcademicLevelsActionAsync } from "../actions/get-academic-levels.action";

export const useExportAcademicLevels = () => {

    const [searchParams] = useSearchParams();

    // Main query params
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query params
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_ACADEMIC_LEVELS_QUERY_KEY, { query, name, status }],
        queryFn: () => getAcademicLevelsActionAsync({
            query,
            name,
            status
        }),
        enabled: false,
    });
}
