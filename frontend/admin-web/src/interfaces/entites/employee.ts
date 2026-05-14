import type { JobTitle } from "./job-title.interface";
import type { SecurityRole } from "./security-role";

export interface Employee {
    id: string;
    name: string;
    firstLastName: string;
    secondLastName: string;
    phoneNumber: string;
    email: string;
    username: string;
    image?: string;
    status: boolean;

    securityRoleId: string;
    securityRole?: SecurityRole;

    jobTitleId: string;
    jobTitle?: JobTitle
}
