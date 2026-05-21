import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAcademicLevelsActionAsync } from "../actions/get-academic-levels.action";

export const useExportAcademicLevels = () => {
    const [searchParams] = useSearchParams();

    // Main query params
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query params
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useMutation({
        mutationFn: () => getAcademicLevelsActionAsync({
            query,
            name,
            status
        }),
    });
}
