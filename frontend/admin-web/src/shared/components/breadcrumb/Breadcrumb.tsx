import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
    label: string;
    to?: string;
}

interface BreadcrumbProps {
    items: Crumb[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
    const location = useLocation();
    return (
        <nav aria-label="Breadcrumb" data-testid="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/home" className="hover:text-primary transition-colors inline-flex items-center gap-2 shrink-0">
                <Home className="w-3.5 h-3.5 mb-[1.4px]" />
                <span className="hidden sm:inline">Inicio</span>
            </Link>
            {items.map((c, i) => {
                const isLast = i === items.length - 1;
                return (
                    <div className="flex flex-row items-center min-w-0" key={`${c.label}-${i}`}>
                        <ChevronRight className="min-w-3.5 min-h-3.5 shrink-0 text-muted-foreground/60" />
                        {c.to && !isLast ? (
                            <Link to={c.to} className="hover:text-primary transition-colors truncate max-w-32 sm:max-w-40 md:max-w-none">
                                {c.label}
                            </Link>
                        ) : (
                            <span
                                className={`${isLast ? "text-foreground font-medium" : ""} truncate ${isLast ? "max-w-48 sm:max-w-[16rem] md:max-w-none" : "max-w-32 sm:max-w-40 md:max-w-none"}`}
                                aria-current={isLast ? "page" : undefined}
                            >
                                {c.label}
                            </span>
                        )}
                    </div>
                );
            })}
            <span className="sr-only">Página actual: {location.pathname}</span>
        </nav>
    );
}
