import { useNavigate } from "react-router";
import { LogOut, User } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
    toggleDropdown: (open: boolean) => void;
    logout: () => void;
}

export const AccountInfoDropdown = ({ toggleDropdown, logout }: Props) => {
    const navigate = useNavigate();
    const panelRef = useRef<HTMLDivElement>(null);

    // Esc closes; also lock body scroll while overlay is open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") toggleDropdown(false);
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [toggleDropdown]);

    return (
        <>
            <section className="fixed inset-0 z-50 flex justify-end">
                <section className="absolute inset-0" onClick={() => toggleDropdown(false)} />
            </section>

            <section ref={panelRef} data-testid="user-menu-dropdown" className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg py-2 animate-fade-in z-50">
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
            </section>
        </>
    )
}
