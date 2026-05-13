import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";

export const getEmployeeByIdActionAsync = async (id: string): Promise<Employee> => {
    if (!id)
        throw new Error('Id del empleado es requerido');

    if(id === "new") {
        return {
            id: "new",
            name: "",
            firstLastName: "",
            secondLastName: "",
            phoneNumber: "",
            email: "",
            username: "",
            avatarUrl: "",
            status: true,
            securityRoleId: "",
            jobTitleId: "",
        }
    }

    await sleep();

    // const { data } = await api.get<SchoolSubject>(`/employees/${id}.json`);

    const { data } = await api.get<Employee[]>(`/employees/employees.json`);
        
        // DELETE THIS LOGIC
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error('No se encontró el empleado');
        // DELETE THIS LOGIC

    return {
        ...response
    };
}
