export interface JobTitle {
    id: string;
    name: string;
    description: string;
    jobTitleType: 'teacher' | 'administrative-staff';
    status: boolean;
}
