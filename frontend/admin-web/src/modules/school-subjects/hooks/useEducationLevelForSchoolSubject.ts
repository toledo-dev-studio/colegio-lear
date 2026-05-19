import { useQuery } from "@tanstack/react-query";

import { GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY } from "../../../lib/queries-key/school-subjects-queries-key";
import { getPagedEducationLevelsActionAsync } from "@/modules/academic-levels/actions/get-paged-education-levels.action";

export const useEducationLevelForSchoolSubject = (academicLevelId?: string, query?: string) => {
    return useQuery({
        queryKey: [GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelId, query],
        queryFn: () => getPagedEducationLevelsActionAsync({ query, page: 1, pageSize: 5, status: true, academicLevelId: academicLevelId! }),
        // enabled: academicLevelId !== undefined && academicLevelId !== null && academicLevelId !== "" && query !== undefined && query !== null && query !== ""
        enabled: !!academicLevelId && !!query
    });
}
