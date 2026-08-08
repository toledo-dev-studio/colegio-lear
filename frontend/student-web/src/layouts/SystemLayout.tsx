import { useState, type PropsWithChildren } from "react";

import { Navbar } from "@/shared/components/navbar/Navbar";
import { Sidebar } from "@/shared/components/sidebar/Sidebar";
import { useAuthStore } from "@/lib/zustand/stores/auth-store/auth.store";
import { useLoaderStore } from "../lib/zustand/stores/loader-store/LoaderStore";

export const SystemLayout = ({ children }: PropsWithChildren) => {

  const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false);

  const { logout } = useAuthStore();
  const { showLoading, hideLoading } = useLoaderStore();

  const handleToggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  }

  const handleLogout = async () => {
    showLoading("Cerrando sesión", "Por favor espere...");
    await logout();
    hideLoading();
  }

  return (
    <>
      <div className="min-h-screen flex bg-background text-foreground" data-testid="dashboard-layout">
        <Sidebar isOpenSidebar={isOpenSidebar} toggleSidebar={handleToggleSidebar} logout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar toggleSidebar={handleToggleSidebar} logout={handleLogout} />
          <main className="flex-1 p-4 sm:p-8 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

export default SystemLayout;
