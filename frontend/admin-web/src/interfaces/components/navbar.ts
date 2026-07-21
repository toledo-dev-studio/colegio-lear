import type { Module } from "./module";

export interface Navbar {
    title: string;
    items: NavbarItem[];
}

export interface NavbarItem {
    module: Module;
    icon: React.ComponentType<{ className?: string }>;
    testId?: string;
    colorClass?: string;
}
