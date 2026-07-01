import { Navigate, useNavigate, useParams } from "react-router";

import { toast } from "sonner";
import { Calendar, CheckCircle2, GraduationCap, Layers, Coins, Banknote, Receipt, Sparkles, ClockAlert, Wallet } from "lucide-react";

import { Loader } from "@/shared/components/loader/Loader";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { OverviewCard } from "@/shared/components/overview-card/OverviewCard";
import { useAcademicCycleEnrollmentPage } from "./hooks/useAcademicCycleEnrollmentPage";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { ACADEMIC_CYCLE_PERIOD_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { OverviewRibbon } from "./components/OverviewRibbon";
import { StatCard } from "@/shared/components/stat-card/StatCard";
import { formatMoney } from "@/lib/extensions/formatters";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";

export const AcademicCycleEnrollmentPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const { enrollmentId } = useParams();

  // Context hooks & stores configuration
  const { context, queries, mutations, loader, isLoadingPage, isLoadingPageError } = useAcademicCycleEnrollmentPage({ id: enrollmentId! });
  const academicCycleEnrollment = queries.enrollment.getById.data;
  const studentWallet = queries.studentWallet.get.data;
  const studentWalletSummary = queries.studentWallet.getSummary.data;

  if (isLoadingPageError) {
    toast.error("No fue posible obtener la información relacionada en alumno seleccionado", { position: "top-right" });
    return <Navigate to={`/academic-cycles/${context.academicCycleId}/enrollments`} />;
  }

  if (isLoadingPage) {
    return (
      <>
        <div className="w-full relative mx-auto h-full mt-30">
          <Loader title="Cargando información" subtitle="Por favor espere..." fullScreen={true} size="default" />
        </div>
      </>
    )
  }

  return (
    <>
      <section className="w-full py-12 px-10 lg:px-15">

        <section className="mb-10">
          <Breadcrumb items={[
            { label: "Seguimiento escolar" },
            { label: "Ciclos escolares", to: "/academic-cycles" },
            { label: context.academicCycle?.code || "Edición de ciclo escolar", to: `/academic-cycles/${context.academicCycleId}/enrollments` },
            { label: academicCycleEnrollment?.student?.enrollment! }
          ]} />
        </section>

        <PageTitle
          title={`DETALLES DE INSCRIPCIÓN "${academicCycleEnrollment?.code}"`}
          subtitle="En esta sección podrás consultar y modificar la información de la incripción del alumno en el ciclo escolar." />

        {/* Main enrollment content */}
        <section className="flex-1 flex flex-col min-h-full gap-8 mt-8">
          {/* Ribbon overview */}
          <OverviewRibbon
            academicCycle={context.academicCycle!}
            academicCycleEnrollment={academicCycleEnrollment!} />

          {/* Payments KPI's overview */}
          <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
            <StatCard icon={Receipt} label="Cartera total" value={formatMoney(studentWalletSummary?.total || 0)} accent="text-primary bg-primary/10" />
            <StatCard icon={Coins} label="Saldo pendiente" value={formatMoney(studentWalletSummary?.outstanding || 0)} accent="text-rose-600 bg-rose-500/10" />
            <StatCard icon={Banknote} label="Pagado al ciclo" value={formatMoney(studentWalletSummary?.paid || 0)} accent="text-emerald-600 bg-emerald-500/10" />
            <StatCard icon={ClockAlert} label="Monto vencido" value={formatMoney(studentWalletSummary?.overdue || 0)} accent="text-amber-600 bg-amber-500/10" />
          </section>
        </section>

        {/* Student wallet details */}
        <section className="bg-card rounded-3xl border border-border shadow-sm p-4 sm:p-6 mb-5">

          {/* Wallet header */}
          <section className="flex items-center gap-3 pb-3 border-b border-border mb-5">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-heading font-bold text-foreground mb-1">Cartera del estudiante</p>
              <p className="text-[11px] text-muted-foreground">Conceptos de pago configurados para este ciclo escolar</p>
            </div>
          </section>

          {/* Student wallet table */}
          <section>
            
          </section>
        </section>


      </section>
    </>
  )
}
