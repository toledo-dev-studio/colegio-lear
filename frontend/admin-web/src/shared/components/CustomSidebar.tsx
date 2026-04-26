import type { Navbar } from "@/interfaces/components/navbar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Fingerprint, BookOpen, Users, CalendarDays, GraduationCap,
  Ruler, Telescope, Wallet, Megaphone, ShieldCheck, UserCog, Settings, LogOut, Briefcase
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { CustomLogo } from "./CustomLogo";

const navbar: Navbar[] = [
  {
    title: "Accesos rápidos",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "dashboard" },

      
      { to: "/mi-cuenta", label: "Mi cuenta", icon: Fingerprint, testid: "nav-mi-cuenta" },
      { to: "/placeholder/mis-clases", label: "Mis clases", icon: BookOpen, testid: "nav-mis-clases" },
    ],
  },
  {
    title: "Seguimiento escolar",
    items: [
      { to: "/academic-levels", label: "Niveles educativos", icon: Ruler, testid: "academic-levels" },
      { to: "/school-subjects", label: "Materias escolares", icon: GraduationCap, testid: "school-subjects" },



      { to: "/placeholder/estudiantes", label: "Estudiantes", icon: Users, testid: "nav-estudiantes" },
      { to: "/placeholder/ciclos", label: "Ciclos escolares", icon: CalendarDays, testid: "nav-ciclos" },
      { to: "/placeholder/becas", label: "Becas y solicitudes", icon: Telescope, testid: "nav-becas" },
    ],
  },
  {
    title: "Configuración escolar",
    items: [
      { to: "/placeholder/conceptos", label: "Conceptos de pago", icon: Wallet, testid: "nav-conceptos" },
      { to: "/placeholder/campanas", label: "Campañas", icon: Megaphone, testid: "nav-campanas" },
    ],
  },
  {
    title: "Seguridad",
    items: [
      { to: "/job-titles", label: "Puestos de trabajo", icon: Briefcase, testid: "job-titles" },



      { to: "/system-users", label: "Usuarios del sistema", icon: UserCog, testid: "nav-usuarios" },
      { to: "/roles", label: "Roles de seguridad", icon: ShieldCheck, testid: "nav-roles" },
      { to: "/placeholder/configuracion", label: "Configuración", icon: Settings, testid: "nav-configuracion" },
    ],
  },
];

interface Props {
  isOpenSidebar: boolean;
  toggleSidebar: () => void;
  logout: () => void;
}

export const CustomSidebar = ({ isOpenSidebar, toggleSidebar, logout }: Props) => {

  const { pathname } = useLocation();

  const isActiveRoute = (to?: string) => {
    if(pathname.includes(to || "")) return true;
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

        <CustomLogo title="COLEGIO LEAR" subtitle="ADMIN SUITE" />

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
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            data-testid={item.testid}
                            // onClick={onClose}
                            className={
                              cn("flex items-center gap-3 px-5 py-4 rounded-md text-sm font-medium transition-all",
                                isActiveRoute(item.to) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")
                            }
                          >
                            <Icon className="w-[18px] h-[18px]" />
                            <span>{item.label}</span>
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
