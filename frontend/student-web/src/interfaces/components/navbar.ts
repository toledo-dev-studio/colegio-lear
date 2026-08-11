/**
 * Modules available in the student tracking portal.
 */
export type ModuleKey =
    | "dashboard"
    | "grades"
    | "school-calendar"
    | "subjects"
    | "attendance"
    | "wallet"
    | "messages"
    | "my-account";

export type Tone = "primary" | "emerald" | "amber" | "violet" | "sky" | "rose";

export interface Navbar {
    title: string;
    items: NavbarItem[];
}

export interface NavbarItem {
    moduleKey: ModuleKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    tone: Tone;
    testId?: string;
}

/**
 * Const to get the color for each tone in navbar
 */
export const ICON_TONE: Record<Tone, string> = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    violet: "bg-violet-500/10 text-violet-600",
    sky: "bg-sky-500/10 text-sky-600",
    rose: "bg-rose-500/10 text-rose-600",
};
