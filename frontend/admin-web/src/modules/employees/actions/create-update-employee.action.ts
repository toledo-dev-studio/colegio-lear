import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { Employee } from "@/interfaces/entites/employee";
import type { EmployeeFormData } from "../interfaces/employee-form";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { Attachment } from "@/interfaces/entites/attachment";

export const createUpdateEmployeeActionAsync = async (employeeLike: Partial<EmployeeFormData>): Promise<Employee> => {
    await sleep();

    const { id } = employeeLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        delete employeeLike.id;
        return {
            id: isCreating ? generateTemporalId() : id,
            ...employeeLike,
        } as Employee;
    }

    // If is a new record, set a temporal unique identifier to backend identify the avatar resource to link to the new record
    
    // if (isCreating && employeeLike.file) {
    //     const formData = new FormData();
    // formData.append('file', employeeLike.file);
    // }
    //     employeeLike.id == generateTemporalId();

    // if (employeeLike.file) {


    //     await api<Attachment>({
    //         url: `attachments/employee/avatar/${employeeLike.id}`,
    //         method: 'POST',
    //         data: formData
    //     });
    // }

    const { data } = await api<Employee>({
        url: `/employees/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: {
            ...employeeLike,
            file: isCreating
        }
    });

    return {
        ...data,
    };
}
