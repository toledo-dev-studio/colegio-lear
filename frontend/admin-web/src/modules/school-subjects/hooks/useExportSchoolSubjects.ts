import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_SCHOOL_SUBJECTS_QUERY_KEY } from "../lib/queries-key";
import { getSchoolSubjectsActionAsync } from "../actions/get-school-subjects.action";

export const useExportSchoolSubjects = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const academicLevelId = searchParams.get('academic-level-id') || undefined;
    const educationLevelId = searchParams.get('education-level-id') || undefined;

    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECTS_QUERY_KEY, { query, status, academicLevelId, educationLevelId }],
        queryFn: () => getSchoolSubjectsActionAsync({
            query,
            status,
            academicLevelId,
            educationLevelId
        }),
        enabled: false
    });
}