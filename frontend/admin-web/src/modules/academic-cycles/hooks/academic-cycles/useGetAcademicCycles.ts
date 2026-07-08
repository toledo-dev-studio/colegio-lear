import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getAcademicCyclesActionAsync } from "../../actions/academic-cycles/get-academic-cycles.action";

export const useGetAcademicCycles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined);
    const code = isValidValueWithDefault(searchParams.get("code")?.trim(), undefined);
    const startDate = isValidValueWithDefault(searchParams.get("start-date")?.trim(), undefined);
    const endDate = isValidValueWithDefault(searchParams.get("end-date")?.trim(), undefined);
    const periodType = isValidValueWithDefault(searchParams.get("period-type")?.trim() as AcademicPeriodTypeKey, undefined);
    const status = isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleStatusKey, undefined);
    const enrollmentOpen = isValidBooleanString(searchParams.get("enrollment-open")) ? stringToBooleanWithDefault(searchParams.get("enrollment-open")) : undefined;
    const academicLevelId = isValidValueWithDefault(searchParams.get("academic-level-id")?.trim(), undefined);
    const educationLevelId = isValidValueWithDefault(searchParams.get("education-level-id")?.trim(), undefined);

    return useMutation({
        mutationFn: () => getAcademicCyclesActionAsync({
            query,
            name,
            code,
            startDate,
            endDate,
            periodType,
            enrollmentOpen,
            status,
            academicLevelId,
            educationLevelId
        }),
    });
}
