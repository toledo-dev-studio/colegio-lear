import { create } from "zustand";

import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import { useAuthStore } from "@/stores/auth-store/auth.store";

/**
 * Cycles the student participates in. Sorted by start date descending.
 * Hydrated from the authenticated user's academic cycles (auth store), so it
 * starts empty and is synced whenever the auth user changes.
 */
export const availableCycles: AcademicCycleResponse[] = [];

const sortCyclesByStartDateDesc = (cycles: AcademicCycleResponse[]): AcademicCycleResponse[] =>
    [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

const getDefaultCycleId = (cycles: AcademicCycleResponse[]): string =>
    cycles.find((c) => c.status === "active")?.id ?? cycles[0]?.id ?? "";

/**
 * Global selected academic cycle for the "cycle-dependent" modules
 * (Calificaciones, Horario, Materias, Asistencia, Cartera, Mensajes).
 *
 * The selection lives in memory (zustand) and is NOT persisted on purpose so the
 * student always starts at the current active cycle on each sign-in.
 */
type ActiveCycleState = {
    academicCycleId: string;
    setAcademicCycleId: (academicCycleId: string) => void;
    hasCycles: boolean;
};

export const useActiveCycleStore = create<ActiveCycleState>()((set) => ({
    academicCycleId: "",
    hasCycles: false,
    setAcademicCycleId: (academicCycleId: string) => set({ academicCycleId }),
}));

const syncAcademicCyclesFromAuth = () => {
    const cycles = sortCyclesByStartDateDesc(
        useAuthStore.getState().user?.academicCycles ?? []
    );
    availableCycles.splice(0, availableCycles.length, ...cycles);
    useActiveCycleStore.setState({
        academicCycleId: getDefaultCycleId(cycles),
        hasCycles: cycles.length > 0,
    });
};

syncAcademicCyclesFromAuth();
useAuthStore.subscribe(syncAcademicCyclesFromAuth);

export const activeCycleSelector = (state: ActiveCycleState) => state.academicCycleId;

export const selectedAcademicCycleSelector = (state: ActiveCycleState): AcademicCycleResponse | null =>
    availableCycles.find((cycle) => cycle.id === state.academicCycleId) ?? null;
