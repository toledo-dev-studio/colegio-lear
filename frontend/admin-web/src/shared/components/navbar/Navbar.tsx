import { Menu } from "lucide-react";

import { AccountInfoButton } from "./components/account-info/AccountInfoButton";
import { ThemeToggleButton } from "./components/theme-toggle/ThemeToggleButton";
import { GlobalSearchInput } from "./components/global-search/GlobalSearchInput";
import { NotificationButton } from "./components/notifications/NotificationButton";

interface Props {
    logout: () => void;
    toggleSidebar: () => void;
}

export const Navbar = ({ toggleSidebar, logout }: Props) => {
    return (
        <header className="sticky top-0 z-50 h-20 bg-card border-b border-border flex items-center gap-2 px-4 sm:px-8">

            <section className="flex flex-row items-center gap-2 lg:hidden">
                <button data-testid="header-menu-button" className="icon-btn" onClick={toggleSidebar}>
                    <Menu className="w-4.5 h-4.5" />
                </button>
            </section>

            <section className="flex-1 w-full mx-auto relative">
                <GlobalSearchInput />
            </section>

            <section className="flex items-center gap-2 sm:gap-4">
                <ThemeToggleButton />

                <NotificationButton />

                <AccountInfoButton logout={logout} />
            </section>
        </header>
    );
}
