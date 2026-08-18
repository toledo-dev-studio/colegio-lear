import { Controller, useForm } from "react-hook-form";
import { Banknote } from "lucide-react";

import { Input } from "@/shared/shadcn/ui/input";
import { formatMoney } from "@/lib/extensions/formatters";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import type { StudentWalletPaymentRequest } from "@/interfaces/requests/student-wallet-payment.request";

interface Props {
    studentWalletItemResponse?: Partial<StudentWalletItemResponse>;
    handleClickClose: () => void;
    onSubmit: (studentWalletPaymentRequestLike: Partial<StudentWalletPaymentRequest>) => void;
}

export const StudentWalletPaymentPanelForm = ({ studentWalletItemResponse, handleClickClose, onSubmit }: Props) => {
    // Use hook form configuration
    const { control, formState: { errors }, handleSubmit } = useForm<Partial<StudentWalletPaymentRequest>>({
        defaultValues: {
            amount: 0,
            paymentMethod: "cash",
            studentWalletItemId: isValidValueWithDefault(studentWalletItemResponse?.id!, undefined),
        }
    });

    return (
        <>
            <SidePanel
                title="REGISTRO DE PAGO EN CAJA"
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickClose }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>
                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Concepto de pago</label>
                        <Input
                            type="text"
                            value={studentWalletItemResponse?.name || ""}
                            disabled={true}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Monto total</label>
                        <Input
                            type="text"
                            value={formatMoney(studentWalletItemResponse?.amount || 0)}
                            disabled={true}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Saldo pagado</label>
                        <Input
                            type="text"
                            value={formatMoney((studentWalletItemResponse?.amount! - studentWalletItemResponse?.outstandingAmount!) || 0)}
                            disabled={true}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Saldo pendiente</label>
                        <Input
                            type="text"
                            value={formatMoney(studentWalletItemResponse?.outstandingAmount || 0)}
                            disabled={true}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Monto de pago (MXN) <span className="required">*</span>:</label>
                        <Controller
                            name="amount"
                            control={control}
                            rules={{
                                required: true,
                                validate: {
                                    integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                    nonNegative: (v) => v! > 0 || "El monto de pago no puede ser negativo o cero",
                                    maximum: (v) => v! <= studentWalletItemResponse?.outstandingAmount! || "El monto de pago no puede ser mayor al saldo pendiente",
                                },
                            }}
                            render={({ field }) => (
                                <div className="relative">
                                    <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        {...field}
                                        step={1}
                                        min={1}
                                        inputMode="numeric"
                                        type="number"
                                        placeholder="1,000"
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", ".", ","].includes(e.key))
                                                e.preventDefault();
                                        }}
                                        onChange={(e) => e.target.value ? field.onChange(e.target.valueAsNumber) : field.onChange("")}
                                    />
                                </div>
                            )}
                        />
                        <p className="control-info">Solo valores enteros — sin decimales</p>
                        {
                            errors.amount && (
                                <p className="error">
                                    {errors.amount.message || "El monto de pago es obligatorio"}
                                </p>
                            )
                        }
                    </div>

                </form>
            </SidePanel>
        </>
    )
}
