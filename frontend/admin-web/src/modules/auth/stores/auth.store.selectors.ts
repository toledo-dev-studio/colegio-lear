import { type AuthState } from "./auth.store";

export const userStoreFullName = ((state: AuthState) => `${state.user?.name ?? ""} ${state.user?.firstLastName ?? ""} ${state.user?.secondLastName ?? ""}`.trim());
export const userStoreImage = ((state: AuthState) => state.user?.image ?? undefined);