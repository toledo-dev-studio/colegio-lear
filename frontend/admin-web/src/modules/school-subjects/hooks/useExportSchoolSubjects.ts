import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { GET_SCHOOL_SUBJECTS_QUERY_KEY } from "../../../lib/queries-key/school-subjects-queries-key";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getSchoolSubjectsActionAsync } from "../actions/get-school-subjects.action";

export const useExportSchoolSubjects = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const academicLevelId = searchParams.get('academic-level-id') || undefined;
    const educationLevelId = searchParams.get('education-level-id') || undefined;

    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECTS_QUERY_KEY, { query, name, status, academicLevelId, educationLevelId }],
        queryFn: () => getSchoolSubjectsActionAsync({
            query,
            name,
            status,
            academicLevelId,
            educationLevelId
        }),
        enabled: false
    });
}