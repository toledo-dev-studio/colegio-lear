import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getSchoolSubjectsForAcademicCycleActionAsync } from "../../actions/school-subjects/get-school-subjects-for-academic-cycle";

export const useGetSchoolSubjectsForAcademicCycle = (academicCycleId: string) => {
    const query = useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY, { academicCycleId: academicCycleId }],
        queryFn: () => getSchoolSubjectsForAcademicCycleActionAsync({ academicCycleId }),
    });

    return {
        ...query,
        data: query.data ?? []
    }
}
