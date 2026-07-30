import { type AuthState } from "./auth.store";

export const userStoreId = ((state: AuthState) => state.user?.id ?? undefined);
export const userStoreImage = ((state: AuthState) => state.user?.avatar ?? undefined);
export const userStoreFullName = ((state: AuthState) => `${state.user?.name ?? ""} ${state.user?.firstLastName ?? ""} ${state.user?.secondLastName ?? ""}`.trim());