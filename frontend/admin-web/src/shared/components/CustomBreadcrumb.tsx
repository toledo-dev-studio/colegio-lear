import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

export const CustomBreadcrumb = ({ items }: BreadcrumbProps) => {
  const location = useLocation();
  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
      <Link to="/dashboard" className="hover:text-primary transition-colors inline-flex items-center gap-2">
        <Home className="w-3.5 h-3.5 mb-[1.4px]" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <div className="flex flex-row items-center" key={`${c.label}-${i}`}>
            <ChevronRight className="min-w-3.5 min-h-3.5 text-muted-foreground/60" />
            {c.to && !isLast ? (
              <Link to={c.to} className="hover:text-primary transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground font-medium" : ""} aria-current={isLast ? "page" : undefined}>
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
