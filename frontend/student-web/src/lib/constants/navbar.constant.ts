import { LayoutDashboard, CalendarRange, BookOpen, GraduationCap, Wallet, MessageSquare, UserRound, ClipboardList } from "lucide-react";

import type { Navbar } from "@/interfaces/components/navbar";

/**
 * Navigation configuration for the student portal. Items under "Mi ciclo" are
 * affected by the global cycle selector; the rest are global modules.
 */
export const NAVBAR: Navbar[] = [
    {
        title: "Accesos rápidos",
        items: [
            {
                moduleKey: "dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
                description: "Vista general de tu rendimiento escolar.",
                tone: "primary",
                testId: "student-nav-dashboard"
            },
            {
                moduleKey: "my-account",
                label: "Mi cuenta",
                icon: UserRound,
                description: "Datos personales, tutores y alergias.",
                tone: "violet",
                testId: "student-nav-profile"
            },
        ],
    },
    {
        title: "Mi ciclo escolar",
        items: [
            {
                moduleKey: "school-calendar",
                label: "Horario escolar",
                icon: CalendarRange,
                description: "Horario semanal de clases.",
                tone: "violet",
                testId: "student-nav-schedule"
            },
            {
                moduleKey: "grades",
                label: "Boleta de calificaciones",
                icon: GraduationCap,
                description: "Boleta de calificaciones del ciclo.",
                tone: "emerald",
                testId: "student-nav-grades"
            },
            {
                moduleKey: "subjects",
                label: "Materias escolares",
                icon: BookOpen,
                description: "Materias, materiales y tareas.",
                tone: "amber",
                testId: "student-nav-subjects"
            },
            {
                moduleKey: "attendance",
                label: "Asistencias",
                icon: ClipboardList,
                description: "Asistencia por materia y día.",
                tone: "primary",
                testId: "student-nav-attendance"
            },
            {
                moduleKey: "wallet",
                label: "Cartera de pagos",
                icon: Wallet,
                description: "Pagos e inscripción del ciclo.",
                tone: "emerald",
                testId: "student-nav-wallet"
            },
            {
                moduleKey: "chats",
                label: "Chats",
                icon: MessageSquare,
                description: "Chat directo con tus maestros.",
                tone: "sky",
                testId: "student-nav-messages"
            },
        ],
    },
]