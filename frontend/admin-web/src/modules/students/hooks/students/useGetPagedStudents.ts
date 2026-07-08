import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_PAGED_STUDENTS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getPagedStudentsActionAsync } from "../../actions/students/get-paged-students.action";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedStudents = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const fullName = isValidValueWithDefault(searchParams.get("full-name")?.trim(), undefined);
    const curp = isValidValueWithDefault(searchParams.get("curp")?.trim(), undefined);
    const enrollment = isValidValueWithDefault(searchParams.get("enrollment")?.trim(), undefined);
    const email = isValidValueWithDefault(searchParams.get("email")?.trim(), undefined);
    const phoneNumber = isValidValueWithDefault(searchParams.get("phone-number")?.trim(), undefined);
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_STUDENTS_QUERY_KEY, {
            query,
            page,
            pageSize,
            fullName,
            curp,
            email,
            enrollment,
            isActive,
            phoneNumber
        }],
        queryFn: () => getPagedStudentsActionAsync({
            query,
            page,
            pageSize,
            fullName,
            curp,
            email,
            enrollment,
            isActive,
            phoneNumber
        }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
