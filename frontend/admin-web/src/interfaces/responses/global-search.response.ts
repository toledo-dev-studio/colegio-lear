import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";

export interface GlobalSearchRecordResponse {
    id: string;
    label: string;
    subtitle?: string;
    route: string;
}

export interface GlobalSearchResponse {
    module: ModuleKey;
    records: GlobalSearchRecordResponse[];
}
