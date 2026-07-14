import { BookOpen, Briefcase, CalendarDays, Coins, GraduationCap, Layers, LayoutDashboard, Megaphone, Presentation, Shield, UserCircle, UserCog, Users } from "lucide-react";
import type { Module } from "../../interfaces/components/module";
import type { KeyValuePair } from "./key-value-pair";

export type ModuleKey =
    | "dashboard"
    | "my-account"
    | "my-classes"
    | "students"
    | "academic-cycles"
    | "announcements"
    | "academic-levels"
    | "school-subjects"
    | "scholarships"
    | "payment-concepts"
    | "employees"
    | "job-titles"
    | "security-roles";

export const DASHBOARD_MODULE: Module = {
    key: "dashboard",
    label: "Dashboard",
    permissions: {
        canRead: true,
    }
};

export const MY_ACCOUNT_MODULE: Module = {
    key: "my-account",
    label: "Mi cuenta",
    permissions: {
        canRead: true,
        canWrite: true
    }
};

export const MY_CLASSES_MODULE: Module = {
    key: "my-classes",
    label: "Mis clases",
    permissions: {
        canRead: true,
        canWrite: true
    }
};

export const STUDENTS_MODULE: Module = {
    key: "students",
    label: "Estudiantes",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const ACADEMIC_CYCLES_MODULE: Module = {
    key: "academic-cycles",
    label: "Ciclos escolares",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const ANNOUNCEMENTS_MODULE: Module = {
    key: "announcements",
    label: "Comunicados & campañas",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const ACADEMIC_LEVELS_MODULE: Module = {
    key: "academic-levels",
    label: "Niveles académicos",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const SCHOOL_SUBJECTS_MODULE: Module = {
    key: "school-subjects",
    label: "Materias escolares",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const SCHOLARSHIPS_MODULE: Module = {
    key: "scholarships",
    label: "Becas escolares",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const PAYMENT_CONCEPTS_MODULE: Module = {
    key: "payment-concepts",
    label: "Conceptos de pago",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const EMPLOYEES_MODULE: Module = {
    key: "employees",
    label: "Empleados",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const JOB_TITLES_MODULE: Module = {
    key: "job-titles",
    label: "Puestos de trabajo",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const SECURITY_ROLES_MODULE: Module = {
    key: "security-roles",
    label: "Roles de seguridad",
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true
    }
};

export const AVAILABLE_MODULES: Module[] = [
    // Accesos rápidos
    DASHBOARD_MODULE,
    MY_ACCOUNT_MODULE,
    MY_CLASSES_MODULE,

    // Seguimiento escolar
    STUDENTS_MODULE,
    ACADEMIC_CYCLES_MODULE,
    ANNOUNCEMENTS_MODULE,

    // Configuración escolar
    ACADEMIC_LEVELS_MODULE,
    SCHOOL_SUBJECTS_MODULE,
    SCHOLARSHIPS_MODULE,
    PAYMENT_CONCEPTS_MODULE,

    // Seguridad
    EMPLOYEES_MODULE,
    JOB_TITLES_MODULE,
    SECURITY_ROLES_MODULE
];

export const MODULE_LABELS: KeyValuePair<ModuleKey>[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "my-account", label: "Mi cuenta" },
    { key: "my-classes", label: "Mis clases" },
    { key: "students", label: "Estudiantes" },
    { key: "academic-cycles", label: "Ciclos escolares" },
    { key: "announcements", label: "Campañas" },
    { key: "academic-levels", label: "Niveles y grados" },
    { key: "school-subjects", label: "Materias escolares" },
    { key: "scholarships", label: "Becas y solicitudes" },
    { key: "payment-concepts", label: "Conceptos de pago" },
    { key: "employees", label: "Personal / docentes" },
    { key: "job-titles", label: "Puestos de trabajo" },
    { key: "security-roles", label: "Roles de seguridad" },
];

export const MODULE_ICON: Record<ModuleKey, { Icon: React.ComponentType<{ className?: string }>; tone: string }> = {
    "dashboard": { Icon: LayoutDashboard, tone: "text-sky-600 bg-sky-500/10" },
    "my-account": { Icon: UserCircle, tone: "text-indigo-600 bg-indigo-500/10" },
    "my-classes": { Icon: Presentation, tone: "text-amber-600 bg-amber-500/10" },
    "students": { Icon: Users, tone: "text-emerald-600 bg-emerald-500/10" },
    "academic-cycles": { Icon: CalendarDays, tone: "text-violet-600 bg-violet-500/10" },
    "announcements": { Icon: Megaphone, tone: "text-rose-600 bg-rose-500/10" },
    "academic-levels": { Icon: Layers, tone: "text-teal-600 bg-teal-500/10" },
    "school-subjects": { Icon: BookOpen, tone: "text-pink-600 bg-pink-500/10" },
    "scholarships": { Icon: GraduationCap, tone: "text-amber-600 bg-amber-500/10" },
    "payment-concepts": { Icon: Coins, tone: "text-emerald-600 bg-emerald-500/10" },
    "employees": { Icon: UserCog, tone: "text-blue-600 bg-blue-500/10" },
    "job-titles": { Icon: Briefcase, tone: "text-orange-600 bg-orange-500/10" },
    "security-roles": { Icon: Shield, tone: "text-red-600 bg-red-500/10" },
};