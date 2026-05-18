import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY } from "../lib/queries-key";
import { getPagedSchoolSubjectsActionAsync } from "../actions/get-paged-school-subjects.action";

export const usePagedSchoolSubjects = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const academicLevelId = searchParams.get('academic-level-id') || undefined;
    const educationLevelId = searchParams.get('education-level-id') || undefined;

    return useQuery({
        queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY, { query, page, pageSize, name, status, academicLevelId, educationLevelId }],
        queryFn: () => getPagedSchoolSubjectsActionAsync({
            query,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
            name,
            status,
            academicLevelId,
            educationLevelId,
        }),
    });
}