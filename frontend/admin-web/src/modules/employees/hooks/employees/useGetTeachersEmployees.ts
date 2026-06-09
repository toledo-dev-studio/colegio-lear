import { useQuery } from "@tanstack/react-query";

import { GET_TEACHERS_EMPLOYEES_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";
import { getTeachersEmployeesActionAsync } from "../../actions/get-teachers-employees.action";

export const useGetTeachersEmployees = () => {
    const query = useQuery({
        queryKey: [GET_TEACHERS_EMPLOYEES_QUERY_KEY],
        queryFn: () => getTeachersEmployeesActionAsync(),
    });

    return {
        ...query,
        data: query.data ?? []
    }
}
