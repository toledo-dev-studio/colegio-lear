import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

interface Options {
    id: string;
    employeeRequestLike: Partial<EmployeeRequest>;
}

export const createUpdateEmployeeAsync = async ({ id, employeeRequestLike }: Options): Promise<EmployeeResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
        return {
            ...employeeRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as EmployeeResponse;
    }

    const fileImage = employeeRequestLike.file;
    delete employeeRequestLike.file;

    const { data } = await api<EmployeeResponse>({
        url: isCreating ? "/employees" : `/employees/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: { ...employeeRequestLike }
    });

    if (fileImage) {
        const avatar = await updateEmployeeAvatarAsync({ id: data.id, file: fileImage });
        return {
            ...data,
            avatar: avatar.url
        }
    }

    return {
        ...data,
    };
}

const updateEmployeeAvatarAsync = async ({ id, file }: { id: string, file: File }) => {
    let formData = new FormData();
    formData.append("file", file);
    
    const { data } = await api<AttachmentResponse>({
        url: `/employees/${id}/avatar`,
        method: "POST",
        data: formData
    });

    return data;
}
