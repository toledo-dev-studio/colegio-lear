import { LayoutDashboard, Fingerprint, BookOpen, Users, CalendarDays, GraduationCap, Ruler, Telescope, Wallet, Megaphone, ShieldCheck, UserCog, Briefcase } from "lucide-react";

import type { Navbar } from "@/interfaces/components/navbar";
import { ACADEMIC_LEVELS_MODULE, ACADEMIC_YEARS_MODULE, ANNOUNCEMENTS_MODULE, DASHBOARD_MODULE, EMPLOYEES_MODULE, JOB_TITLES_MODULE, MY_ACCOUNT_MODULE, MY_CLASSES_MODULE, PAYMENT_CONCEPTS_MODULE, SCHOLARSHIPS_MODULE, SCHOOL_SUBJECTS_MODULE, SECURITY_ROLES_MODULE, STUDENTS_MODULE } from "@/interfaces/components/modules";

/**
 * Default navbar configuration for the application. 
 * Each section contains a title and a list of items, where each item represents a module with its corresponding icon and test ID.
 */
export const NAVBAR: Navbar[] = [
    {
        title: "Accesos rápidos",
        items: [
            { module: DASHBOARD_MODULE, icon: LayoutDashboard, testId: "nav-dashboard" },
            { module: MY_ACCOUNT_MODULE, icon: Fingerprint, testId: "nav-my-account" },
            { module: MY_CLASSES_MODULE, icon: BookOpen, testId: "nav-my-classes" },
        ],
    },
    {
        title: "Seguimiento escolar",
        items: [
            { module: STUDENTS_MODULE, icon: Users, testId: "nav-students" },
            { module: ACADEMIC_YEARS_MODULE, icon: CalendarDays, testId: "nav-academic-years" },
            { module: ANNOUNCEMENTS_MODULE, icon: Megaphone, testId: "nav-announcements" },
        ],
    },
    {
        title: "Configuración escolar",
        items: [
            { module: ACADEMIC_LEVELS_MODULE, icon: Ruler, testId: "nav-academic-levels" },
            { module: SCHOOL_SUBJECTS_MODULE, icon: GraduationCap, testId: "nav-school-subjects" },
            { module: SCHOLARSHIPS_MODULE, icon: Telescope, testId: "nav-scholarships" },
            { module: PAYMENT_CONCEPTS_MODULE, icon: Wallet, testId: "nav-payment-concepts" },
        ],
    },
    {
        title: "Seguridad",
        items: [
            { module: EMPLOYEES_MODULE, icon: UserCog, testId: "nav-employees" },
            { module: JOB_TITLES_MODULE, icon: Briefcase, testId: "nav-job-titles" },
            { module: SECURITY_ROLES_MODULE, icon: ShieldCheck, testId: "nav-security-roles" },
        ],
    },
];