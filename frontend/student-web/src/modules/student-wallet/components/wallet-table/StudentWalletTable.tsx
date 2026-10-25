import { Wallet } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { formatFriendlyDate, formatMoney } from "@/lib/extensions/formatters";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import { STUDENT_WALLET_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import type { StudentWalletSummaryResponse } from "@/interfaces/responses/student-wallet-summary.response";

interface Props {
    enableActions?: boolean;
    data: StudentWalletItemResponse[];
    summary: StudentWalletSummaryResponse;
    handleClickPay: (item: StudentWalletItemResponse) => void;
}

export const StudentWalletTable = ({ enableActions = false, data, summary, handleClickPay = () => {} }: Props) => {
    return (
        <>
            <section className="flex flex-col">

                {/* Student wallet table */}
                <section className="table-container">

                    <table className="table">

                        <thead>
                            {/* Columns */}
                            <tr>
                                <th className="column">Concepto</th>
                                <th className="column">Código</th>
                                <th className="column">Vencimiento</th>
                                <th className="column">Prórroga</th>
                                <th className="column">Monto total</th>
                                <th className="column">Pagado</th>
                                <th className="column">Saldo pendiente</th>
                                <th className="column">Estatus</th>
                                <th className="column">¿Concepto condonado?</th>
                                {
                                    enableActions && (
                                        <th className="column">Acciones</th>
                                    )
                                }
                            </tr>
                        </thead>

                        <tbody>
                            {/* No content */}
                            {
                                (!data.length) && (
                                    <tr>
                                        <td colSpan={enableActions ? 10 : 9} className="no-content-row">
                                            Este alumno no cuenta con una cartera de pagos.
                                        </td>
                                    </tr>
                                )
                            }

                            {/* Content */}
                            {
                                (data.length > 0) && (
                                    <>
                                        {
                                            data.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="row">{item.name}</td>
                                                    <td className="row">{item.code}</td>
                                                    <td className="row">{formatFriendlyDate(item.dueDate)}</td>
                                                    <td className="row">{item.extensionDate ? formatFriendlyDate(item.extensionDate) : "-"}</td>
                                                    <td className="row">{formatMoney(item.amount)}</td>
                                                    <td className="row">{formatMoney(item.amount - item.outstandingAmount)}</td>
                                                    <td className="row">{formatMoney(item.outstandingAmount)}</td>
                                                    <td className="row">
                                                        <Badge variant={
                                                            item.status === "paid" ? "success" :
                                                                item.status === "pending" ? "default" :
                                                                    item.status === "overdue" ? "destructive" : "secondary"} className="py-4 px-6">
                                                            {labelOf(STUDENT_WALLET_STATUSES, item.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="row">
                                                        <Badge variant={item.isForgiven ? "default" : "ghost"} className="py-4 px-6">
                                                            {
                                                                item.isForgiven ? "Sí" : "No"
                                                            }
                                                        </Badge>
                                                    </td>
                                                    {
                                                        enableActions && (
                                                            <td className="row">
                                                                {
                                                                    (item.status !== "paid" && item.status !== "forgiven") && (
                                                                        <div className="flex flex-row gap-4">
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <span className="bg-success text-white icon-btn icon-btn-sm" onClick={() => handleClickPay(item)}>
                                                                                        <Wallet className="w-4 h-4" />
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Pago en línea</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </div>
                                                                    )
                                                                }
                                                            </td>
                                                        )
                                                    }

                                                </tr>
                                            ))
                                        }
                                        <tr className="bg-muted/50 transition-colors">
                                            <td className="column">TOTALES</td>
                                            <td className="column"></td>
                                            <td className="column"></td>
                                            <td className="column"></td>
                                            <td className="column">{formatMoney(summary.total)}</td>
                                            <td className="column">{formatMoney(summary.paid)}</td>
                                            <td className="column">{formatMoney(summary.outstanding)}</td>
                                            <td className="column"></td>
                                            <td className="column"></td>
                                            {
                                                enableActions && (
                                                    <td className="column"></td>
                                                )
                                            }
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
