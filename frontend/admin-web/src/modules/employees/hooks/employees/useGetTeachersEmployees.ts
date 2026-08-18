import { useQuery } from "@tanstack/react-query";

import { GET_TEACHERS_EMPLOYEES_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";
import { getTeachersEmployeesAsync } from "../../api/get-teachers-employees.api";

export const useGetTeachersEmployees = () => {
    const query = useQuery({
        queryKey: [GET_TEACHERS_EMPLOYEES_QUERY_KEY],
        queryFn: () => getTeachersEmployeesAsync(),
    });

    return {
        ...query,
        data: query.data ?? []
    }
}
