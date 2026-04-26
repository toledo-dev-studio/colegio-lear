export interface Navbar {
    title: string;
    items: NavbarItem[];
}

export interface NavbarItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    testid: string;
}
