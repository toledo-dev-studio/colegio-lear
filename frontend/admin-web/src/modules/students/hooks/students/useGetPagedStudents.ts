import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedStudentsActionAsync } from "../../actions/students/get-paged-students.action";
import { GET_PAGED_STUDENTS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedStudents = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("pageSize"), 10);

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const curp = searchParams.get("curp")?.trim() || undefined;
    const enrollment = searchParams.get("enrollment")?.trim() || undefined;
    const email = searchParams.get("email")?.trim() || undefined;
    const phoneNumber = searchParams.get("phone-number")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_STUDENTS_QUERY_KEY, { query, page, pageSize, name, curp, enrollment, email, phoneNumber, status }],
        queryFn: () => getPagedStudentsActionAsync({
            query,
            page,
            pageSize,
            name,
            curp,
            enrollment,
            email,
            phoneNumber,
            status,
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
