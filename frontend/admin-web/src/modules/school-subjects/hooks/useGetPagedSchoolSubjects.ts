import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedSchoolSubjectsActionAsync } from "../actions/get-paged-school-subjects.action";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY } from "@/lib/queries-key/school-subjects-queries-key";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedSchoolSubjects = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;
    const academicLevelId = searchParams.get("academic-level-id") || undefined;
    const educationLevelId = searchParams.get("education-level-id") || undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY, { query, page, pageSize, name, status, academicLevelId, educationLevelId }],
        queryFn: () => getPagedSchoolSubjectsActionAsync({
            query,
            page,
            pageSize,
            name,
            status,
            academicLevelId,
            educationLevelId,
        }),
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}