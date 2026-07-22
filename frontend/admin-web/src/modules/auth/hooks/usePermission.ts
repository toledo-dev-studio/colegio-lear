import { useAuthStore } from "../stores/auth.store";

import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";

export const usePermission = (moduleKey: ModuleKey, permission: "can-read" | "can-write" | "can-delete") => {
    return useAuthStore(state =>
        state.checkPermission(moduleKey, permission)
    );
};
