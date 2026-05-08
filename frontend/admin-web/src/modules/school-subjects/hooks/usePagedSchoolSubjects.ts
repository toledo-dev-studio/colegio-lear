import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { getPagedSchoolSubjectsActionAsync } from "../actions/get-paged-school-subjects.action";
import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY } from "../lib/queries-key";

export const usePagedSchoolSubjects = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const academicLevelId = searchParams.get('academic-level-id') || undefined;
    const educationLevelId = searchParams.get('education-level-id') || undefined;

    return useQuery({
        queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY, { query, page, status, pageSize, academicLevelId, educationLevelId }],
        queryFn: () => getPagedSchoolSubjectsActionAsync({
            query,
            status,
            academicLevelId,
            educationLevelId,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
        }),
    });
}