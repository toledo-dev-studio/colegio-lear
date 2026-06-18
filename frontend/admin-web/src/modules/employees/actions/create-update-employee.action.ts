import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options {
    id: string;
    employeeRequestLike: Partial<EmployeeRequest>;
}

export const createUpdateEmployeeActionAsync = async ({ id, employeeRequestLike }: Options): Promise<EmployeeResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (VITE_ENVIRONMENT === "mockable") {
        return {
            ...employeeRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as EmployeeResponse;
    }

    let fileFormData = new FormData();
    if (employeeRequestLike.file)
        fileFormData.append('file', employeeRequestLike.file);

    const { data } = await api<EmployeeResponse>({
        url: isCreating ? "/employees" : `/employees/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: {
            ...employeeRequestLike,
            file: employeeRequestLike.file ? fileFormData : undefined
        }
    });

    return {
        ...data,
    };
}
