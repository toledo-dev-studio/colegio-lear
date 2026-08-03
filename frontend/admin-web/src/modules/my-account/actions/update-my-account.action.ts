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

    const fileImage = employeeRequestLike.file;
    delete employeeRequestLike.file;

    const { data } = await api.patch<EmployeeResponse>("/employees/me", {
        name: employeeRequestLike.name,
        firstLastName: employeeRequestLike.firstLastName,
        secondLastName: employeeRequestLike.secondLastName,
        phoneNumber: employeeRequestLike.phoneNumber,
    });

    if (fileImage) {
        const avatar = await updateMyAccountAvatarActionAsync({ id: data.id, file: fileImage });
        return {
            ...avatar
        }
    }

    return {
        ...data,
    };
}

const updateMyAccountAvatarActionAsync = async ({ file }: { id: string, file: File }) => {
    let formData = new FormData();
    formData.append("file", file);
    
    const { data } = await api<EmployeeResponse>({
        url: `/employees/me/avatar`,
        method: "POST",
        data: formData
    });    

    return data;
}
