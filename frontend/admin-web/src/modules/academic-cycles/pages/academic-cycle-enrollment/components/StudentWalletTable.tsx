import { Pencil, Wallet } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Loader } from "@/shared/components/loader/Loader";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { formatFriendlyDate, formatMoney } from "@/lib/extensions/formatters";
import { STUDENT_WALLET_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import type { StudentWalletSummaryResponse } from "@/interfaces/responses/student-wallet-summary.response";

interface Props {
    isLoading: boolean;
    enableActions?: boolean;
    data: StudentWalletItemResponse[];
    summary: StudentWalletSummaryResponse;
    handleClickEdit: (item: StudentWalletItemResponse) => void;
    handleClickPay: (item: StudentWalletItemResponse) => void;
}

export const StudentWalletTable = ({ isLoading, enableActions = true, data, summary, handleClickEdit, handleClickPay }: Props) => {
    return (
        <>
            <section className="flex flex-col gap-y-1.5 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">

                <header className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-heading font-bold text-foreground mb-1">Cartera del estudiante</p>
                        <p className="text-[11px] text-muted-foreground">Conceptos de pago configurados para este ciclo escolar</p>
                    </div>
                </header>

                {/* Student wallet table */}
                <section className="table-container">

                    <table className="table">

                        <thead>
                            {/* Columns */}
                            <tr>
                                <th className="column">Concepto</th>
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
                            {/* Loading */}
                            {
                                isLoading && (
                                    <tr>
                                        <td colSpan={enableActions ? 9 : 8} className="no-content-row">
                                            <Loader title="Cargando información" subtitle="por favor espere..." fullScreen={false} size="sm" />
                                        </td>
                                    </tr>
                                )
                            }

                            {/* No content */}
                            {
                                (!data.length && !isLoading) && (
                                    <tr>
                                        <td colSpan={enableActions ? 9 : 8} className="no-content-row">
                                            Este alumno no cuenta con una cartera de pagos.
                                        </td>
                                    </tr>
                                )
                            }

                            {/* Content */}
                            {
                                (data.length > 0 && !isLoading) && (
                                    <>
                                        {
                                            data.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="row">{item.name}</td>
                                                    <td className="row">{formatFriendlyDate(item.dueDate)}</td>
                                                    <td className="row">{item.extensionDate ? formatFriendlyDate(item.extensionDate) : "-"}</td>
                                                    <td className="row">{formatMoney(item.amount)}</td>
                                                    <td className="row">{formatMoney(item.amount - item.outstandingAmount)}</td>
                                                    <td className="row">{formatMoney(item.outstandingAmount)}</td>
                                                    <td className="row">
                                                        <Badge variant={
                                                            item.status === "paid" ? "success" :
                                                                item.status === "pending" ? "default" :
                                                                    item.status === "overdue" ? "destructive" : "ghost"} className="py-4 px-6">
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
                                                                                    <p>Registrar pago</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>

                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <span className="bg-primary text-white icon-btn icon-btn-sm" onClick={() => handleClickEdit(item)}>
                                                                                        <Pencil className="w-4 h-4" />
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Editar concepto de pago</p>
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
                                            <td className="column">{formatMoney(summary.total)}</td>
                                            <td className="column">{formatMoney(summary.outstanding)}</td>
                                            <td className="column">{formatMoney(summary.overdue)}</td>
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
