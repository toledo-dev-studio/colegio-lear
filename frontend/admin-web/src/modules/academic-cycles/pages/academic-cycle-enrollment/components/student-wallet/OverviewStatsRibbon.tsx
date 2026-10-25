import { Banknote, ClockAlert, Coins, Receipt } from "lucide-react";

import { formatMoney } from "@/lib/extensions/formatters";
import { StatCard } from "@/shared/components/stat-card/StatCard";
import type { StudentWalletSummaryResponse } from "@/interfaces/responses/student-wallet-summary.response";

interface Props {
    studentWalletSummary: StudentWalletSummaryResponse;
}

export const OverviewStatsRibbon = ({ studentWalletSummary }: Props) => {
    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard
                    icon={Receipt}
                    label="Cartera total"
                    value={formatMoney(studentWalletSummary?.total || 0)}
                    accent="text-primary bg-primary/10" />
                <StatCard
                    icon={Coins}
                    label="Saldo pendiente"
                    value={formatMoney(studentWalletSummary?.outstanding || 0)}
                    accent="text-rose-600 bg-rose-500/10" />
                <StatCard
                    icon={Banknote}
                    label="Pagado al ciclo"
                    value={formatMoney(studentWalletSummary?.paid || 0)}
                    accent="text-emerald-600 bg-emerald-500/10" />
                <StatCard
                    icon={ClockAlert}
                    label="Monto vencido"
                    value={formatMoney(studentWalletSummary?.overdue || 0)}
                    accent="text-amber-600 bg-amber-500/10" />
            </section>
        </>
    )
}
