import { LayoutDashboard, Fingerprint, BookOpen, Users, CalendarDays, GraduationCap, Ruler, Telescope, Wallet, Megaphone, ShieldCheck, UserCog, Briefcase, Home } from "lucide-react";

import type { Navbar } from "@/interfaces/components/navbar";
import { ACADEMIC_LEVELS_MODULE, ACADEMIC_CYCLES_MODULE, ANNOUNCEMENTS_MODULE, DASHBOARD_MODULE, EMPLOYEES_MODULE, JOB_TITLES_MODULE, MY_ACCOUNT_MODULE, MY_CLASSES_MODULE, PAYMENT_CONCEPTS_MODULE, SCHOLARSHIPS_MODULE, SCHOOL_SUBJECTS_MODULE, SECURITY_ROLES_MODULE, STUDENTS_MODULE, HOME_MODULE } from "@/lib/key-value-pairs/key-value-pair-modules";

/**
 * Default navbar configuration for the application. 
 * Each section contains a title and a list of items, where each item represents a module with its corresponding icon and test ID.
 */
export const NAVBAR: Navbar[] = [
    {
        title: "Accesos rápidos",
        items: [
            {
                module: HOME_MODULE,
                icon: Home,
                description: "Accesos rápidos a los principales módulos del sistema.",
                tone: "primary",
                testId: "nav-home"
            },
            {
                module: DASHBOARD_MODULE,
                icon: LayoutDashboard,
                description: "Métricas y KPIs de la operación completa.",
                tone: "primary",
                testId: "nav-dashboard"
            },
            {
                module: MY_ACCOUNT_MODULE,
                icon: Fingerprint,
                description: "Actualiza tu perfil y preferencias.",
                tone: "sky",
                testId: "nav-my-account"
            },
        ],
    },
    {
        title: "Seguimiento escolar",
        items: [
            {
                module: MY_CLASSES_MODULE,
                icon: BookOpen,
                description: "Consulta tus grupos, materias y horarios asignados.",
                tone: "violet",
                testId: "nav-my-classes"
            },
            {
                module: STUDENTS_MODULE,
                icon: Users,
                description: "Ficha del alumno, ciclos y cartera.",
                tone: "emerald",
                testId: "nav-students"
            },
            {
                module: ACADEMIC_CYCLES_MODULE,
                icon: CalendarDays,
                description: "Grupos, horarios, materias y calendario.",
                tone: "violet",
                testId: "nav-academic-cycles"
            },
            {
                module: ANNOUNCEMENTS_MODULE,
                icon: Megaphone,
                description: "Comunicados y notificaciones a la comunidad.",
                tone: "sky",
                testId: "nav-announcements"
            },
        ],
    },
    {
        title: "Configuración escolar",
        items: [
            {
                module: ACADEMIC_LEVELS_MODULE,
                icon: Ruler,
                description: "Administra los niveles educativos del colegio.",
                tone: "primary",
                testId: "nav-academic-levels"
            },
            {
                module: SCHOOL_SUBJECTS_MODULE,
                icon: GraduationCap,
                description: "Catálogo de materias impartidas en la institución.",
                tone: "violet",
                testId: "nav-school-subjects"
            },
            {
                module: SCHOLARSHIPS_MODULE,
                icon: Telescope,
                description: "Gestiona becas y porcentajes de descuento.",
                tone: "emerald",
                testId: "nav-scholarships"
            },
            {
                module: PAYMENT_CONCEPTS_MODULE,
                icon: Wallet,
                description: "Catálogo de cargos aplicables a alumnos.",
                tone: "amber",
                testId: "nav-payment-concepts"
            },
        ],
    },
    {
        title: "Seguridad",
        items: [
            {
                module: EMPLOYEES_MODULE,
                icon: UserCog,
                description: "Personas con acceso al panel.",
                tone: "rose",
                testId: "nav-employees"
            },
            {
                module: JOB_TITLES_MODULE,
                icon: Briefcase,
                description: "Estructura organizacional del colegio.",
                tone: "primary",
                testId: "nav-job-titles"
            },
            {
                module: SECURITY_ROLES_MODULE,
                icon: ShieldCheck,
                description: "Permisos granulares por módulo.",
                tone: "emerald",
                testId: "nav-security-roles"
            },
        ],
    },
];
