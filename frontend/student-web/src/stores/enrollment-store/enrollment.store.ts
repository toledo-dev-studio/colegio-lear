import { create } from "zustand";

import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import { useAuthStore } from "@/stores/auth-store/auth.store";

/**
 * Enrollments (inscriptions) the student participates in. Sorted by their
 * academic cycle start date descending. Hydrated from the authenticated user's
 * enrollments (auth store), so it starts empty and is synced whenever the auth
 * user changes.
 */
export const availableEnrollments: AcademicCycleEnrollmentResponse[] = [];

const sortEnrollmentsByCycleStartDateDesc = (enrollments: AcademicCycleEnrollmentResponse[]): AcademicCycleEnrollmentResponse[] =>
    [...enrollments].sort(
        (a, b) => new Date(b.academicCycle?.startDate ?? 0).getTime() - new Date(a.academicCycle?.startDate ?? 0).getTime()
    );

const getDefaultEnrollmentId = (enrollments: AcademicCycleEnrollmentResponse[]): string =>
    enrollments.find((enrollment) => enrollment.academicCycle?.status === "active")?.id ?? enrollments[0]?.id ?? "";

/**
 * Global selected enrollment for the enrollment-dependent modules (Calificaciones,
 * Horario, Materias, Asistencia, Cartera, Mensajes). Each enrollment belongs to a
 * single academic cycle, whose data is always derived from the selected enrollment.
 *
 * The selection lives in memory (zustand) and is NOT persisted on purpose so the
 * student always starts at the current active enrollment on each sign-in.
 */
type ActiveEnrollmentState = {
    enrollmentId: string;
    setEnrollmentId: (enrollmentId: string) => void;
    hasEnrollments: boolean;
};

export const useActiveEnrollmentStore = create<ActiveEnrollmentState>()((set) => ({
    enrollmentId: "",
    hasEnrollments: false,
    setEnrollmentId: (enrollmentId: string) => set({ enrollmentId }),
}));

const syncEnrollmentsFromAuth = () => {
    const enrollments = sortEnrollmentsByCycleStartDateDesc(
        useAuthStore.getState().user?.enrollments ?? []
    );
    availableEnrollments.splice(0, availableEnrollments.length, ...enrollments);
    useActiveEnrollmentStore.setState({
        enrollmentId: getDefaultEnrollmentId(enrollments),
        hasEnrollments: enrollments.length > 0,
    });
};

syncEnrollmentsFromAuth();
useAuthStore.subscribe(syncEnrollmentsFromAuth);

export const activeEnrollmentSelector = (state: ActiveEnrollmentState) => state.enrollmentId;

export const selectedEnrollmentSelector = (state: ActiveEnrollmentState): AcademicCycleEnrollmentResponse | null =>
    availableEnrollments.find((enrollment) => enrollment.id === state.enrollmentId) ?? null;
