export type ModuleKeys =
    | 'dashboard'
    | 'my-account'
    | 'my-classes'
    | 'students'
    | 'academic-years'
    | 'announcements'
    | 'academic-levels'
    | 'school-subjects'
    | 'scholarships'
    | 'payment-concepts'
    | 'employees'
    | 'job-titles'
    | 'security-roles'
    | 'settings';

export interface Module {
    key: ModuleKeys;
    label: string;
    permissions: {
        canRead?: boolean;
        canWrite?: boolean;
        canDelete?: boolean;
    }
}

export const DASHBOARD_MODULE: Module = {
    key: 'dashboard',
    label: 'Dashboard',
    permissions: {
        canRead: true,
    }
};

export const MY_ACCOUNT_MODULE: Module = {
    key: 'my-account',
    label: 'Mi cuenta',
    permissions: {
        canRead: true,
        canWrite: true
    }
};

export const MY_CLASSES_MODULE: Module = {
    key: 'my-classes',
    label: 'Mis clases',
    permissions: {
        canRead: true,
        canWrite: true
    }
};

export const STUDENTS_MODULE: Module = {
    key: 'students',
    label: 'Estudiantes',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const ACADEMIC_YEARS_MODULE: Module = {
    key: 'academic-years',
    label: 'Ciclos escolares',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const ANNOUNCEMENTS_MODULE: Module = {
    key: 'announcements',
    label: 'Comunicados & Campañas',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const ACADEMIC_LEVELS_MODULE: Module = {
    key: 'academic-levels',
    label: 'Niveles académicos',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const SCHOOL_SUBJECTS_MODULE: Module = {
    key: 'school-subjects',
    label: 'Materias escolares',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const SCHOLARSHIPS_MODULE: Module = {
    key: 'scholarships',
    label: 'Becas escolares',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const PAYMENT_CONCEPTS_MODULE: Module = {
    key: 'payment-concepts',
    label: 'Conceptos de pago',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const EMPLOYEES_MODULE: Module = {
    key: 'employees',
    label: 'Empleados',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const JOB_TITLES_MODULE: Module = {
    key: 'job-titles',
    label: 'Puestos de trabajo',
    permissions: {
        canRead: true,
        canWrite: true,
        canDelete: true,
    }
};

export const SECURITY_ROLES_MODULE: Module = {
    key: 'security-roles',
    label: 'Roles de seguridad',
    permissions: {
        canRead: true,
        canWrite: true,
    }
};

export const SETTINGS_MODULE: Module = {
    key: 'settings',
    label: 'Configuración',
    permissions: {
        canRead: true,
        canWrite: true,
    }
};
export const AVAILABLE_MODULES: Module[] = [
    // Accesos rápidos
    DASHBOARD_MODULE,
    MY_ACCOUNT_MODULE,
    MY_CLASSES_MODULE,

    // Seguimiento escolar
    STUDENTS_MODULE,
    ACADEMIC_YEARS_MODULE,
    ANNOUNCEMENTS_MODULE,

    // Configuración escolar
    ACADEMIC_LEVELS_MODULE,
    SCHOOL_SUBJECTS_MODULE,
    SCHOLARSHIPS_MODULE,
    PAYMENT_CONCEPTS_MODULE,

    // Seguridad
    EMPLOYEES_MODULE,
    JOB_TITLES_MODULE,
    SECURITY_ROLES_MODULE,
    SETTINGS_MODULE,
];
