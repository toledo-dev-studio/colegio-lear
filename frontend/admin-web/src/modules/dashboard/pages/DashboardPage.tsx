import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { SystemSummary } from "./components/system/SystemSummary";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { FinancialSummary } from "./components/financial/FinancialSummary";
import { userStoreFullName } from "@/modules/auth/stores/auth.store.selectors";
import { AnnouncementsSummary } from "./components/announcements/AnnouncementsSummary";
import { AcademicCyclesSummary } from "./components/academic-cycles/AcademicCyclesSummary";

export const DashboardPage = () => {
  // Component hooks & stores
  const loggedInUserFullName = useAuthStore(userStoreFullName);
  
  return (
    <>
      <section className="page-main-section px-4 py-8">
        
        <PageTitle title={`Hola de nuevo, ${loggedInUserFullName}`} subtitle="Panel de control administrativo · Visión general del sistema" />
        
        <AcademicCyclesSummary />

        <FinancialSummary />

        <AnnouncementsSummary />

        <SystemSummary />
      </section>
    </>
  )
}
