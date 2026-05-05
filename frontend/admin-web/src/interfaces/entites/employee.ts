import type { JobTitle } from "./job-title.interface";
import type { Role } from "./role";

export interface Employee {
    id: string;
    name: string;
    firstLastName: string;
    secondLastName: string;
    phoneNumber: string;
    email: string;
    username: string;
    status: boolean;

    roleId: string;
    role?: Role;

    jobTitleId: string;
    jobTitle?: JobTitle
}
