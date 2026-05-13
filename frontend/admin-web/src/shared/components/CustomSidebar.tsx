import { Link, useLocation } from "react-router";
import { LayoutDashboard, Fingerprint, BookOpen, Users, CalendarDays, GraduationCap, Ruler, Telescope, Wallet, Megaphone, ShieldCheck, UserCog, LogOut, Briefcase } from "lucide-react";

import { cn } from "@/lib/utils";
import { CustomLogo } from "./CustomLogo";
import type { Navbar } from "@/interfaces/components/navbar";
import { ACADEMIC_LEVELS_MODULE, ACADEMIC_YEARS_MODULE, ANNOUNCEMENTS_MODULE, DASHBOARD_MODULE, EMPLOYEES_MODULE, JOB_TITLES_MODULE, MY_ACCOUNT_MODULE, MY_CLASSES_MODULE, PAYMENT_CONCEPTS_MODULE, SCHOLARSHIPS_MODULE, SCHOOL_SUBJECTS_MODULE, SECURITY_ROLES_MODULE, STUDENTS_MODULE } from "@/interfaces/components/modules";

const navbar: Navbar[] = [
  {
    title: "Accesos rápidos",
    items: [
      { module: DASHBOARD_MODULE, icon: LayoutDashboard, testId: "nav-dashboard" },
      { module: MY_ACCOUNT_MODULE, icon: Fingerprint, testId: "nav-my-account" },
      { module: MY_CLASSES_MODULE, icon: BookOpen, testId: "nav-my-classes" },
    ],
  },
  {
    title: "Seguimiento escolar",
    items: [
      { module: STUDENTS_MODULE, icon: Users, testId: "nav-students" },
      { module: ACADEMIC_YEARS_MODULE, icon: CalendarDays, testId: "nav-academic-years" },
      { module: ANNOUNCEMENTS_MODULE, icon: Megaphone, testId: "nav-announcements" },
    ],
  },
  {
    title: "Configuración escolar",
    items: [
      { module: ACADEMIC_LEVELS_MODULE, icon: Ruler, testId: "nav-academic-levels" },
      { module: SCHOOL_SUBJECTS_MODULE, icon: GraduationCap, testId: "nav-school-subjects" },
      { module: SCHOLARSHIPS_MODULE, icon: Telescope, testId: "nav-scholarships" },
      { module: PAYMENT_CONCEPTS_MODULE, icon: Wallet, testId: "nav-payment-concepts" },
    ],
  },
  {
    title: "Seguridad",
    items: [
      { module: EMPLOYEES_MODULE, icon: UserCog, testId: "nav-employees" },
      { module: JOB_TITLES_MODULE, icon: Briefcase, testId: "nav-job-titles" },
      { module: SECURITY_ROLES_MODULE, icon: ShieldCheck, testId: "nav-security-roles" },
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
    if (pathname.includes(to || "")) return true;
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
                        <li key={item.module.key}>
                          <Link
                            to={`/${item.module.key}`}
                            data-testid={item.testId}
                            onClick={isOpenSidebar ? toggleSidebar : ()=>{}}
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
