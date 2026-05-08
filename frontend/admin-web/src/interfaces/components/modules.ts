export type ModuleKeys = 
    | 'dashboard'
    | 'my-account'
    | 'academic-levels'
    | 'employees'
    | 'job-titles'
    | 'scholarships'
    | 'school-subjects'
    | 'security-roles';

export const AVAILABLE_MODULES: Module[] = [
    // Accesos rápidos
    {
        key: 'dashboard',
        name: 'Dashboard',
    },
    {
        key: 'my-account',
        name: 'Mi cuenta',
    },

    // Seguimiento escolar
    {
        key: 'academic-levels',
        name: 'Niveles académicos',
    },
    {
        key: 'scholarships',
        name: 'Becas',
    },
    {
        key: 'school-subjects',
        name: 'Materias',
    },
    // Configuración escolar

    // Seguridad
    {
        key: 'employees',
        name: 'Empleados',
    },
    {
        key: 'job-titles',
        name: 'Puestos de trabajo',
    },
    {
        key: 'security-roles',
        name: 'Roles de seguridad',
    },
];

export interface Module {
    key: ModuleKeys;
    name: string;
}
