import { useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Banknote, X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import { useSearchPaymentConcepts } from "@/modules/payment-concepts/hooks/useSearchPaymentConcepts";
import type { AcademicCycleWalletRequest } from "@/interfaces/requests/academic-cycle-wallet.request";
import type { AcademicCycleWalletResponse } from "@/interfaces/responses/academic-cycle-wallet.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Props {
    academicCycleWalletResponse?: Partial<AcademicCycleWalletResponse>;
    handleClickClose: () => void;
    onSubmit: (academicCycleWalletRequestLike: Partial<AcademicCycleWalletRequest>) => void;
}

export const AcademicCycleWalletPanelForm = ({ academicCycleWalletResponse, handleClickClose, onSubmit }: Props) => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Component hooks & stores
    const searchPaymentConcepts = useSearchPaymentConcepts();

    // Use hook form configuration
    const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<Partial<AcademicCycleWalletRequest>>({
        defaultValues: {
            academicCycleId: academicCycleId,
            amount: isValidValueWithDefault(academicCycleWalletResponse?.amount, 0),
            dueDate: isValidValueWithDefault(academicCycleWalletResponse?.dueDate, ""),
            paymentConceptId: isValidValueWithDefault(academicCycleWalletResponse?.paymentConceptId, ""),
            allowForgiveness: isValidValueWithDefault(academicCycleWalletResponse?.allowForgiveness, false),
            paymentConcept: isValidValueWithDefault(academicCycleWalletResponse?.paymentConcept, undefined),
        }
    });
    const paymentConcept = watch("paymentConcept");
    const isNotSelectedPaymentConcept = !paymentConcept;

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">

                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />

                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">

                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            ASOCIACIÓN DE CONCEPTO
                        </h3>
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground px-0!">
                            <X className="w-5! h-5! text-muted-foreground" />
                        </Button>
                    </div>

                    <section className="flex-1 overflow-y-auto px-10 py-10 space-y-5">

                        <section className="flex flex-col gap-8">

                            <div className="control-container">
                                <label className="label">Concepto de pago <span className="required">*</span>:</label>
                                <Controller
                                    name="paymentConceptId"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <SearchInput
                                            {...field}
                                            defaultValue={paymentConcept?.name}
                                            selected={!!paymentConcept}
                                            placeholder="Busqueda de concepto de pago"
                                            options={searchPaymentConcepts.paymentConcepts ?? []}
                                            isSearching={searchPaymentConcepts.isPending}
                                            onClearSelection={() => {
                                                setValue("paymentConceptId", "");
                                                setValue("paymentConcept", undefined);
                                                setValue("amount", 0);
                                                setValue("dueDate", "");
                                                setValue("allowForgiveness", false);
                                            }}
                                            onOptionChange={async (option: PaymentConceptResponse) => {
                                                setValue("paymentConceptId", option.id);
                                                setValue("paymentConcept", option);
                                                setValue("amount", option.amount);
                                                setValue("allowForgiveness", option.allowForgiveness);
                                                searchPaymentConcepts.clearSearchResult();
                                            }}
                                            onSearch={async (query) => searchPaymentConcepts.searchAsync({ query, isActive: true })}
                                        />
                                    )}
                                />
                                {
                                    (errors.paymentConceptId && !paymentConcept) && (
                                        <p className="error">
                                            El concepto de pago es obligatorio
                                        </p>
                                    )
                                }
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
                                            nonNegative: (v) => v! >= 0 || "El monto de pago no puede ser negativo",
                                        },
                                    }}
                                    disabled={isNotSelectedPaymentConcept}
                                    render={({ field }) => (
                                        <div className="relative">
                                            <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                step={1}
                                                min={1}
                                                inputMode="numeric"
                                                type="number"
                                                placeholder="100"
                                                disabled={isNotSelectedPaymentConcept}
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

                            <div className="control-container">
                                <label className="label">Entre límite de pago <span className="required">*</span>:</label>
                                <Controller
                                    name="dueDate"
                                    control={control}
                                    disabled={isNotSelectedPaymentConcept}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isNotSelectedPaymentConcept}
                                        />
                                    )}
                                />
                                {
                                    errors.dueDate && (
                                        <p className="error">
                                            La fecha límite de pago es requerido
                                        </p>
                                    )
                                }
                            </div>

                            <div className="control-container">
                                <label className="label">¿Permitir condonación?:</label>
                                <div className="flex items-center justify-center">
                                    <Controller
                                        name="allowForgiveness"
                                        control={control}
                                        disabled={isNotSelectedPaymentConcept}
                                        render={({ field }) => (
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Permitido" : "No permitido"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">El concepto de pago permite la condonación del pago.</p>
                                                </div>
                                                <Switch disabled={isNotSelectedPaymentConcept} checked={field.value} onCheckedChange={field.onChange} />
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>

                        </section>
                    </section>

                    {/* Actions section */}
                    <section className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button type="button" variant={"ghost"} onClick={handleClickClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant={"default"}>
                            Guardar
                        </Button>
                    </section>

                </aside>

            </form>
        </>
    )
}
