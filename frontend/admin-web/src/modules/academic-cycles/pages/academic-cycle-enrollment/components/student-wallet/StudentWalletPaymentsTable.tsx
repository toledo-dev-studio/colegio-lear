import { Banknote } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { formatMoney } from "@/lib/extensions/formatters";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { STUDENT_WALLET_PAYMENT_METHODS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import type { StudentWalletPaymentResponse } from "@/interfaces/responses/student-wallet-payment.response";

interface Props {
    studentWallet: StudentWalletItemResponse[];
    studentWalletPayments: StudentWalletPaymentResponse[];
}

export const StudentWalletPaymentsTable = ({ studentWallet, studentWalletPayments }: Props) => {
    const totalPaid = studentWalletPayments.reduce((acc, payment) => acc + payment.amount, 0);
    return (
        <>
            <section className="flex flex-col gap-y-1.5 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">

                <header className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-heading font-bold text-foreground mb-1">Historial de pagos realizados</p>
                        <p className="text-[11px] text-muted-foreground">Listado de transacciones realizadas en la cartera del alumno</p>
                    </div>
                </header>

                {/* Student wallet payment table */}
                <section className="table-container">

                    <table className="table">

                        <thead>
                            {/* Columns */}
                            <tr>
                                <th className="column">Folio de pago</th>
                                <th className="column">Concepto</th>
                                <th className="column">Código</th>
                                <th className="column">Monto pagado</th>
                                <th className="column">Tipo de pago</th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* No content */}
                            {
                                (!studentWalletPayments.length) && (
                                    <tr>
                                        <td colSpan={5} className="no-content-row">
                                            No se encontraron registros de pagos realizados en la cartera del alumno.
                                        </td>
                                    </tr>
                                )
                            }

                            {/* Content */}
                            {
                                (studentWalletPayments.length > 0) && (
                                    <>
                                        {
                                            studentWalletPayments.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="row">{item.folio}</td>
                                                    <td className="row">
                                                        {
                                                            studentWallet.find((walletItem) => walletItem.id === item.studentWalletItemId)?.name || "-"
                                                        }
                                                    </td>
                                                    <td className="row">
                                                        {
                                                            studentWallet.find((walletItem) => walletItem.id === item.studentWalletItemId)?.code || "-"
                                                        }
                                                    </td>
                                                    <td className="row">{formatMoney(item.amount)}</td>
                                                    <td className="row">
                                                        <Badge variant={item.paymentMethod === "cash" ? "success" : "default"} className="py-4 px-6">
                                                            {labelOf(STUDENT_WALLET_PAYMENT_METHODS, item.paymentMethod)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        <tr className="bg-muted/50 transition-colors">
                                            <td className="column">TOTALES</td>
                                            <td className="column"></td>
                                            <td className="column">{formatMoney(totalPaid)}</td>
                                            <td className="column"></td>
                                        </tr>
                                    </>
                                )
                            }
                        </tbody>
                    </table>

                </section>

            </section>
        </>
    )
}
