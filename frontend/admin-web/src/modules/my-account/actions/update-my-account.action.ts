import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options {
    employeeRequestLike: Partial<EmployeeRequest>;
}

export const updateMyAccountActionAsync = async ({ employeeRequestLike }: Options): Promise<EmployeeResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        return employeeRequestLike as EmployeeResponse;
    }

    let fileFormData = new FormData();
    if (employeeRequestLike.file)
        fileFormData.append('file', employeeRequestLike.file);

    const { data } = await api.patch<EmployeeResponse>("/employees/me", {
        name: employeeRequestLike.name,
        firstLastName: employeeRequestLike.firstLastName,
        secondLastName: employeeRequestLike.secondLastName,
        phoneNumber: employeeRequestLike.phoneNumber,
        file: employeeRequestLike.file ? fileFormData : undefined
    });

    return {
        ...data,
    };
}
