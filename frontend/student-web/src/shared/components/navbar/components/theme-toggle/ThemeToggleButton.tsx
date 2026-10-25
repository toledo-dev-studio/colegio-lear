import { use } from "react";

import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/contexts/ThemeContext";

export const ThemeToggleButton = () => {
    const { theme, toggleTheme } = use(ThemeContext);

    return (
        <>
            <button onClick={toggleTheme} data-testid="theme-toggle" className="icon-btn" aria-label="Cambiar tema">
                {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
        </>
    )
}
