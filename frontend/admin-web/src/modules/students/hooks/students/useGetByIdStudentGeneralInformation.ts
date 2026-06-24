import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentGeneralInformationByIdActionAsync } from "../../actions/students/get-student-general-information-by-id.action";

export const useGetByIdStudentGeneralInformation = (id?: string) => {
    return useQuery({
        queryKey: [GET_STUDENT_QUERY_KEY, { id }],
        queryFn: () => getStudentGeneralInformationByIdActionAsync(id),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
