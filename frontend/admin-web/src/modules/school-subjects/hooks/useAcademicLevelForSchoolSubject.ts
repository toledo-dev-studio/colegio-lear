import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY } from "../../../lib/queries-key/school-subjects-queries-key";
import { getPagedAcademicLevelsActionAsync } from "@/modules/academic-levels/actions/get-paged-academic-levels.action";

export const useAcademicLevelForSchoolSubject = (query?: string) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, query],
        queryFn: () => getPagedAcademicLevelsActionAsync({ query, page: 1, pageSize: 5, status: true }),
        enabled: !!query
    });
}
