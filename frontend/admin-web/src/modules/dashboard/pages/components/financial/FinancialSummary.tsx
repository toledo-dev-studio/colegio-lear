import { Banknote, Clock, HandCoins, HandHeart } from "lucide-react";

import { formatMoney } from "@/lib/extensions/formatters";
import { KpiCard } from "@/shared/components/kpi-card/KpiCard";
import { SectionHeader } from "@/modules/dashboard/components/SectionHeader";
import { useGetFinancialSummary } from "@/modules/dashboard/hooks/useGetFinancialSummary";

export const FinancialSummary = () => {
    const { data, isFetching } = useGetFinancialSummary();

    return (
        <>
            <section data-testid="dash-payment-summary">
                <SectionHeader label="Resumen financiero de ciclos escolares" tone="sky" />
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
                    <KpiCard
                        label="Total pagado"
                        icon={Banknote}
                        tone="emerald"
                        hint="Acumulado en cartera saldada de ciclos activos"
                        testid="dash-payments-total-paid"
                        value={formatMoney(data?.totalPaidAmount ?? 0)}
                        loading={isFetching} />
                    <KpiCard
                        label="Pendiente de pago"
                        icon={Clock}
                        tone="amber"
                        hint="Saldo por cobrar en carteras de ciclos activos"
                        testid="dash-payments-pending"
                        value={formatMoney(data?.pendingAmount ?? 0)}
                        loading={isFetching} />
                    <KpiCard
                        label="Conteo de pagos condonados"
                        icon={HandHeart}
                        tone="sky"
                        hint="Número de pagos condonados en carteras de ciclos activos"
                        testid="dash-payments-pending"
                        value={data?.forgivenPaymentsCount ?? 0}
                        loading={isFetching} />
                    <KpiCard
                        label="Monto total de pagos condonados"
                        icon={HandCoins}
                        tone="violet"
                        hint="Monto total acumulado en pagos condonados en carteras de ciclos activos"
                        testid="dash-payments-pending"
                        value={formatMoney(data?.totalForgivenAmount ?? 0)}
                        loading={isFetching} />
                </div>
            </section>
        </>
    );
}
