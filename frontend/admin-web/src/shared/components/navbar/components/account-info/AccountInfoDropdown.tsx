import { useNavigate } from "react-router";
import { LogOut, User } from "lucide-react";

interface Props {
    toggleDropdown: (open: boolean) => void;
    logout: () => void;
}

export const AccountInfoDropdown = ({ toggleDropdown, logout }: Props) => {
    const navigate = useNavigate();
    return (
        <>
            <div data-testid="user-menu-dropdown"
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg py-2 animate-fade-in"
                onMouseLeave={() => toggleDropdown(false)}>
                <button
                    onClick={() => {
                        toggleDropdown(false);
                        navigate("/my-account");
                    }}
                    data-testid="user-menu-profile"
                    className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                    <User className="w-4 h-4" />
                    Mi cuenta
                </button>
                <button
                    onClick={() => {
                        toggleDropdown(false);
                        logout();
                    }}
                    data-testid="user-menu-logout"
                    className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                </button>
            </div>
        </>
    )
}
