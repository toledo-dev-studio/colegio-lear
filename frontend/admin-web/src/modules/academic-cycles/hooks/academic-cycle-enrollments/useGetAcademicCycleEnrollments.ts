import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { AcademicCycleEnrollmentStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { GET_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getAcademicCycleEnrollmentsAsync } from "../../api/academic-cycle-enrollments/get-academic-cycle-enrollments.api";

interface Options {
    academicCycleId: string;
}

export const useGetAcademicCycleEnrollments = ({ academicCycleId }: Options) => {
    const [searchParams] = useSearchParams();

    // Advanced query filters
    const scholarshipId = isValidValueWithDefault(searchParams.get("scholarship-id")?.trim(), undefined);
    const academicCycleSchoolGroupId = isValidValueWithDefault(searchParams.get("school-group-id")?.trim(), undefined);
    const status = isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleEnrollmentStatusKey, undefined);

    const queryResult = useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, {
            academicCycleId,
            scholarshipId,
            academicCycleSchoolGroupId,
            status
        }],
        queryFn: () => getAcademicCycleEnrollmentsAsync({
            academicCycleId,
            scholarshipId,
            academicCycleSchoolGroupId,
            status
        }),
        enabled: (!!academicCycleId),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult?.data ?? []
    }
}
