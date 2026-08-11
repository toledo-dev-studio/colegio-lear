import { LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

import { useDashboardPage } from "../hooks/useDashboardPage";
import { WalletStatsSkeleton } from "../components/wallet-stats/WalletStatsSkeleton";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { AcademicCycleOverview } from "../components/academic-cycle-overview/AcademicCycleOverview";
import { AcademicCycleOverviewSkeleton } from "../components/academic-cycle-overview/AcademicCycleOverviewSkeleton";
import { WalletStats } from "../components/wallet-stats/WalletStats";
import { StudentGradesGridSkeleton } from "../components/student-grades/StudentGradesGridSkeleton";
import { StudentGradesGrid } from "../components/student-grades/StudentGradesGrid";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export const DashboardPage = () => {
  const { context, queries } = useDashboardPage();

  if (queries.enrollmentQuery.isError) {
    toast.error(
      "No fue posible obtener la información de la inscripción relacionada al ciclo escolar seleccionado",
      { position: "top-right" },
    );
  }

  if (queries.walletQuery.isError) {
    toast.error(
      "No fue posible obtener la información de la cartera del estudiante relacionada al ciclo escolar seleccionado",
      { position: "top-right" },
    );
  }

  return (
    <>
      <section className="page-main-section">

        {/* Hero overview */}
        <ModulePageTitle
          icon={LayoutDashboard}
          badge="Dashboard"
          studentName={context.student?.fullName || "Bienvenido(a)"}
          description="Resumen general de tu ciclo escolar: consulta tu inscripción y grupo asignado, revisa el estado de cuenta de tu cartera de pagos y da seguimiento a tu rendimiento académico por materia."
          title={`${getGreeting()},`}
          cycle={context.academicCycle}
        />

        {/* Ribbon overview */}
        <section>
          {queries.enrollmentQuery.isLoading ? (<AcademicCycleOverviewSkeleton />) : (<AcademicCycleOverview academicCycle={context.academicCycle!} academicCycleEnrollment={queries.enrollmentQuery.data!} />)}
        </section>

        {/* Wallet stats */}
        <section>
          {queries.walletQuery.isLoading ? (<WalletStatsSkeleton />) : <WalletStats studentWalletSummary={queries.walletQuery.data?.summary!} />}
        </section>

        {/* Student grades */}
        <section>
          {queries.studentGradesQuery.isLoading ? (<StudentGradesGridSkeleton />) : <StudentGradesGrid studentGrades={queries.studentGradesQuery.data ?? []} academicCycleId={context.academicCycle?.id!} enrollmentId={queries.enrollmentQuery.data?.id!} evaluationCount={context.academicCycle?.evaluationCount ?? 0} minimumPassingGrade={context.academicCycle?.minimumPassingGrade ?? 0} academicCycleSchoolGroupId={queries.enrollmentQuery.data?.academicCycleSchoolGroupId!} />}
        </section>
      </section>
    </>
  );
};
