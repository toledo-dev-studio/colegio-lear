import { Link, useLocation } from "react-router";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/extensions/utils";
import { NAVBAR } from "@/lib/constants/navbar.constant";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { ColegioLearLogo } from "../colegio-lear-logo/ColegioLearLogo";
import { filterNavbarByPermissions } from "@/lib/helpers/navbar.helper";

interface Props {
  isOpenSidebar: boolean;
  toggleSidebar: () => void;
  logout: () => void;
}

export const Sidebar = ({ isOpenSidebar, toggleSidebar, logout }: Props) => {

  const { pathname } = useLocation();
  const { permissions } = useAuthStore();
  const navbar = filterNavbarByPermissions(NAVBAR, permissions);

  const isActiveRoute = (to?: string) => {
    if (pathname.startsWith(`/${to}` || "")) return true;
    return pathname === to;
  }

  return (
    <>
      {isOpenSidebar && <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={toggleSidebar} data-testid="sidebar-overlay" />}

      <aside
        data-testid="sidebar"
        className={
          cn("fixed top-0 left-0 z-40 h-screen w-72 bg-card border-r border-border flex flex-col transition-transform duration-300",
            "lg:sticky lg:translate-x-0",
            `${isOpenSidebar ? "translate-x-0" : "-translate-x-full"}`
          )}>

        <ColegioLearLogo title="COLEGIO LEAR" subtitle="ADMIN SUITE" />

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {
            navbar.map((nav) => (
              <div key={nav.title}>
                <p className="section-heading px-3 mb-2">{nav.title}</p>
                <ul className="space-y-1">
                  {
                    nav.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.module.key}>
                          <Link
                            to={`/${item.module.key}`}
                            data-testid={item.testId}
                            onClick={isOpenSidebar ? toggleSidebar : () => { }}
                            className={
                              cn("flex items-center gap-3 px-5 py-4 rounded-md text-sm font-medium transition-all",
                                isActiveRoute(item.module.key) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")
                            }
                          >
                            <Icon className="w-[18px] h-[18px]" />
                            <span>{item.module.label}</span>
                          </Link>
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            ))}
        </nav>

        <button
          onClick={logout}
          data-testid="sidebar-logout"
          className="cursor-pointer m-4 flex items-center gap-3 px-5 py-4 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
          <LogOut className="w-[18px] h-[18px]" />
          Cerrar sesión
        </button>

      </aside>
    </>
  );
}
