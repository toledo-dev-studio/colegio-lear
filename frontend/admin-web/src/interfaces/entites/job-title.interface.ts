export type JobTitleTypes = 'teacher' | 'administrative-staff';

export interface JobTitle {
    id: string;
    name: string;
    description: string;
    jobTitleType: JobTitleTypes;
    status: boolean;
}
