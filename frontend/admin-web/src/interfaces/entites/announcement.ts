export interface Announcement {
    id: string;
    name: string;
    description: string;
    content: string;
    publishedAt: string; // Date - ISO string (YYYY-MM-DDTHH:mm:ss.mmmZ)
    expiresAt: string; // Date - ISO string
    status: boolean;
}
