import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options {
    employeeRequestLike: Partial<EmployeeRequest>;
}

export const updateMyAccountAsync = async ({ employeeRequestLike }: Options): Promise<EmployeeResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
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
        const avatar = await updateMyAccountAvatarAsync({ id: data.id, file: fileImage });
        return {
            ...avatar
        }
    }

    return {
        ...data,
    };
}

const updateMyAccountAvatarAsync = async ({ file }: { id: string, file: File }) => {
    let formData = new FormData();
    formData.append("file", file);
    
    const { data } = await api<EmployeeResponse>({
        url: `/employees/me/avatar`,
        method: "POST",
        data: formData
    });    

    return data;
}
