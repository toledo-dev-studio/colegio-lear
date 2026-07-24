import type { ModuleKey } from "../../lib/key-value-pairs/key-value-pair-modules";

export interface Module {
    key: ModuleKey;
    label: string;
    permissions: {
        canRead?: boolean;
        canWrite?: boolean;
        canDelete?: boolean;
    }
}