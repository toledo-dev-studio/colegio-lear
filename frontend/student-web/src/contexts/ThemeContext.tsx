import { createContext, useEffect, useState, type PropsWithChildren } from "react";

export type Theme = 'light' | 'dark';

const getCurrentTheme = (): Theme => {
    const theme = localStorage.getItem('theme');
    return theme === 'dark' ? 'dark' : 'light'
};

interface ThemeContextProps {
    // State
    theme: 'light' | 'dark';

    // Methods
    toggleTheme: () => void;
}

export const ThemeContext = createContext({} as ThemeContextProps);

export const ThemeContextProvider = ({ children }: PropsWithChildren) => {
    const [theme, setTheme] = useState<Theme>(getCurrentTheme());

    const toggleTheme = (): void => {
        setTheme(theme === 'light' ? 'dark' : 'light');
        localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');
    }

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark")
            root.classList.add("dark");
        else
            root.classList.remove("dark");
    }, [theme]);

    return (
        <ThemeContext
            value={{
                theme: theme,
                toggleTheme: toggleTheme
            }}>
            {children}
        </ThemeContext>
    )

}
