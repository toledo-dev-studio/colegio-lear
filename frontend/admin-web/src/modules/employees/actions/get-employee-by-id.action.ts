import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getEmployeeByIdActionAsync = async (id: string): Promise<Employee> => {
    await sleep();
    
    if (id === "new") {
        return {
            id: undefined,
            name: "",
            firstLastName: "",
            secondLastName: "",
            phoneNumber: "",
            email: "",
            username: "",
            image: "",
            status: true,
            securityRoleId: "",
            jobTitleId: "",
        } as unknown as Employee;
    }

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<Employee[]>(`/employees/employees.json`);
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error('No se encontró el empleado');
        return response;
    }

    const { data } = await api.get<Employee>(`/employees/${id}`);
    return data;
}
