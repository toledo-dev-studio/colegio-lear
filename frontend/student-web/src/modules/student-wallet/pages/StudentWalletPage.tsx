import { Wallet } from "lucide-react";

import { useStudentWalletPage } from "../hooks/useStudentWalletPage";
import { StudentWalletTable } from "../components/wallet-table/StudentWalletTable";
import { WalletStats } from "@/modules/dashboard/components/wallet-stats/WalletStats";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { StudentWalletTableSkeleton } from "../components/wallet-table/StudentWalletTableSkeleton";
import { WalletStatsSkeleton } from "@/modules/dashboard/components/wallet-stats/WalletStatsSkeleton";
import { StudentWalletPaymentsTable } from "../components/wallet-payments-table/StudentWalletPaymentsTable";
import { StudentWalletPaymentsTableSkeleton } from "../components/wallet-payments-table/StudentWalletPaymentsTableSkeleton";
import { CardHeader } from "@/shared/components/card-header/CardHeader";

export const StudentWalletPage = () => {
  const { context, queries } = useStudentWalletPage();
  return (
    <>
      <section className="page-main-section">

        {/* Page title */}
        <ModulePageTitle
          icon={Wallet}
          badge="Mi ciclo escolar"
          studentName={`${context.student?.fullName}`}
          description="Consulta el estado de cuenta de tu ciclo escolar, da seguimiento a tus conceptos de pago y revisa el historial de transacciones realizadas."
          title="Cartera de pagos, "
          cycle={context.academicCycle}
        />

        {/* Wallet stats */}
        <section className="card">
          <CardHeader
            icon={Wallet}
            title="Resumen de cartera de pagos"
            description="Consulta el resumen general de tu cartera de pagos de este ciclo escolar."
            tone="primary"
          />
          {queries.walletQuery.isLoading ? (<WalletStatsSkeleton />) : <WalletStats studentWalletSummary={queries.walletQuery.data?.summary!} />}
        </section>

        {/* Student wallet table */}
        <section className="card">
          <CardHeader
            icon={Wallet}
            title="Cartera del estudiante"
            description="Conceptos de pago configurados para este ciclo escolar"
            tone="sky"
          />
          {
            queries.walletQuery.isLoading ?
              <StudentWalletTableSkeleton /> :
              <StudentWalletTable
                enableActions={false}
                data={queries.walletQuery.data?.items ?? []}
                summary={queries.walletQuery.data?.summary!}
                handleClickPay={() => { }} />
          }
        </section>

        {/* Student wallet payment time line */}
        <section>
          {
            queries.walletPaymentsQuery.isLoading ?
              <StudentWalletPaymentsTableSkeleton /> :
              <StudentWalletPaymentsTable
                studentWallet={queries.walletQuery.data?.items ?? []}
                studentWalletPayments={queries.walletPaymentsQuery.data}
              />
          }
        </section>

      </section>
    </>
  )
}
