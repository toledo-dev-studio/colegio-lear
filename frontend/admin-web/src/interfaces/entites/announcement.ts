import type { Attachment } from "./attachment";

export type AudienceType = { key: string, label: string };

export interface Announcement {
    id: string;
    name: string;
    description: string;
    audience: AudienceType[]; 
    content: string;
    publishedAt: string; // Date - ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
    expiresAt: string; // Date - ISO string
    status: boolean;

    attachments: Attachment[];
}

export const AUDIENCE: AudienceType[] = [
    { key: "administrative-staff", label: "Personal administrativo" },
    { key: "teacher", label: "Docentes" },
    { key: "student", label: "Alumnos" }
];
