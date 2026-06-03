import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/types/KeyValuePair";
import { isValidBooleanString, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAcademicCyclesActionAsync } from "../../actions/academic-cycles/get-academic-cycles.action";

export const useExportAcademicCycles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const code = searchParams.get("code")?.trim() || undefined;
    const startDate = searchParams.get("startDate")?.trim() || undefined;
    const endDate = searchParams.get("endDate")?.trim() || undefined;
    const type = searchParams.get("type")?.trim() as AcademicPeriodTypeKey || undefined;
    const enrollmentOpen = isValidBooleanString(searchParams.get("enrollmentOpen")) ? stringToBooleanWithDefault(searchParams.get("enrollmentOpen")) : undefined;
    const status = searchParams.get("status") as AcademicCycleStatusKey || undefined;

    return useMutation({
        mutationFn: () => getAcademicCyclesActionAsync({
            query,
            name,
            code,
            startDate,
            endDate,
            type,
            enrollmentOpen,
            status,
        }),
    });
}
