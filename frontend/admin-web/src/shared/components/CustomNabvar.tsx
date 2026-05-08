import { use, useState } from "react";
import { Search, Sun, Bell, Menu, ChevronDown, User, LogOut, Moon } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { ThemeContext } from "../context/ThemeContext";

interface Props {
    toggleSidebar: () => void;
}

export const CustomNavbar = ({ toggleSidebar }: Props) => {

    const { theme, toggleTheme } = use(ThemeContext);
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);

    return (
        <header className="sticky top-0 z-20 h-20 bg-card border-b border-border flex items-center gap-2 px-4 sm:px-8">

            <div className="flex flex-row items-center gap-2 lg:hidden">
                <button data-testid="header-menu-button" className="icon-btn" onClick={toggleSidebar}>
                    <Menu className="w-4.5 h-4.5" />
                </button>
            </div>

            <div className="flex-1 w-full mx-auto relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Búsqueda..."
                    data-testid="header-search-input"
                    className="w-full h-11 pl-12"
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={toggleTheme}
                    data-testid="theme-toggle"
                    className="icon-btn"
                    aria-label="Cambiar tema"
                >
                    {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </button>
                <button
                    data-testid="header-notifications"
                    className="icon-btn"
                    aria-label="Notificaciones"
                >
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                </button>

                <div className="relative">
                    <button
                        data-testid="header-user-menu"
                        className="cursor-pointer flex items-center gap-3 pl-2 pr-1 py-1 rounded-full"
                        onClick={() => setToggleDropdown(!toggleDropdown)}>
                        <span className="hidden md:inline text-sm font-medium text-foreground">
                            Emmanuel Toledo Castro
                        </span>
                        <img className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                            alt="avatar"
                            src="https://gravatar.com/avatar/569a633053dd643d3f4daa8ed6a5a16e?s=400&d=robohash&r=x" />
                        <ChevronDown className="hidden md:inline w-4 h-4 text-muted-foreground" />
                    </button>

                    {toggleDropdown && (
                        <div data-testid="user-menu-dropdown"
                            className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg py-2 animate-fade-in"
                            onMouseLeave={() => setToggleDropdown(false)}>
                            <button
                                onClick={() => { setToggleDropdown(false); }}
                                data-testid="user-menu-profile"
                                className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                <User className="w-4 h-4" />
                                Mi cuenta
                            </button>
                            <button
                                onClick={() => { setToggleDropdown(false); }}
                                data-testid="user-menu-logout"
                                className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                                <LogOut className="w-4 h-4" />
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
