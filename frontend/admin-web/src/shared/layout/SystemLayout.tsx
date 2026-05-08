import { useState, type PropsWithChildren } from "react";

import { CustomNavbar } from "@/shared/components/CustomNabvar";
import { CustomSidebar } from "@/shared/components/CustomSidebar";

export const SystemLayout = ({ children }: PropsWithChildren) => {
  const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  }

  const handleLogout = () => {
    console.log("Cerrar sesión");
  }

  return (
    <>
      <div className="min-h-screen flex bg-background text-foreground" data-testid="dashboard-layout">
        <CustomSidebar isOpenSidebar={isOpenSidebar} toggleSidebar={handleToggleSidebar} logout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          <CustomNavbar toggleSidebar={handleToggleSidebar} />
          <main className="flex-1 p-4 sm:p-8 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

export default SystemLayout;
