import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useOutletContext } from "react-router";
import { Banknote } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";
import { useSearchPaymentConcepts } from "@/modules/payment-concepts/hooks/useSearchPaymentConcepts";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

interface Props {
    academicCycleWallet?: Partial<AcademicCycleWallet | undefined>;
    setAcademicCycleWallet: React.Dispatch<React.SetStateAction<Partial<AcademicCycleWallet | undefined>>>;
    onSubmit: (academicCycleWalletLike: Partial<AcademicCycleWallet>) => void;
}

export const AcademicCycleWalletForm = ({ academicCycleWallet, setAcademicCycleWallet, onSubmit }: Props) => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Component hooks & stores
    const searchPaymentConcepts = useSearchPaymentConcepts();
    const paymentConceptSearchInputRef = useRef<HTMLInputElement>(null);

    // Use hook form configuration
    const { control, handleSubmit, formState: { errors }, watch, setFocus, setValue, reset } = useForm<Partial<AcademicCycleWallet>>({
        defaultValues: {
            id: academicCycleWallet?.id,
            amount: academicCycleWallet?.amount ?? undefined,
            allowForgiveness: academicCycleWallet?.allowForgiveness ?? undefined,
            dueDate: academicCycleWallet?.dueDate ?? "",
            paymentConceptId: academicCycleWallet?.paymentConceptId ?? "",
            paymentConcept: academicCycleWallet?.paymentConcept ?? undefined,
            academicCycleId: academicCycleId,
        }
    });
    const isNewRecord = watch("id") === undefined;
    const paymentConcept = watch("paymentConcept");
    const disabled = !paymentConcept;

    useEffect(() => {
        requestAnimationFrame(() => {
            reset({
                id: academicCycleWallet?.id,
                amount: academicCycleWallet?.amount ?? undefined,
                allowForgiveness: academicCycleWallet?.allowForgiveness ?? undefined,
                dueDate: academicCycleWallet?.dueDate ?? "",
                paymentConceptId: academicCycleWallet?.paymentConceptId ?? "",
                paymentConcept: academicCycleWallet?.paymentConcept ?? undefined,
                academicCycleId: academicCycleId,
            });
            if (academicCycleWallet?.id)
                requestAnimationFrame(() => setFocus("amount"));
        });
    }, [academicCycleWallet]);

    return (
        <>
            <form className="flex flex-col gap-y-8"
                onSubmit={
                    handleSubmit(
                        onSubmit,
                        () => (errors.paymentConceptId && !paymentConcept?.id) && paymentConceptSearchInputRef.current?.focus())
                }>
                <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                    <TabSectionTitle
                        title="ASOCIACIÓN DE CONCEPTOS DE PAGO AL CICLO ESCOLAR"
                        description="En esta sección podrás configurar aquellos conceptos de pago que deberán saldar los alumnos una vez inscritos a este ciclo escolar." />

                    {/* Fields */}
                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="control-container">
                            <label className="label">Concepto de pago <span className="required">*</span>:</label>
                            <Controller
                                name="paymentConceptId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchInput
                                        {...field}
                                        ref={paymentConceptSearchInputRef}
                                        defaultValue={paymentConcept?.name}
                                        selected={!!paymentConcept}
                                        placeholder="Busqueda de concepto de pago"
                                        options={searchPaymentConcepts.paymentConcepts ?? []}
                                        isSearching={searchPaymentConcepts.isPending}
                                        onClearSelection={() => {
                                            setValue("paymentConceptId", undefined);
                                            setValue("paymentConcept", undefined);
                                            setValue("amount", undefined);
                                            setValue("dueDate", undefined);
                                            setValue("allowForgiveness", false);
                                        }}
                                        onOptionChange={async (option: PaymentConcept) => {
                                            setValue("paymentConceptId", option.id);
                                            setValue("paymentConcept", option);
                                            setValue("amount", option.amount);
                                            setValue("allowForgiveness", option.allowForgiveness);
                                            searchPaymentConcepts.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchPaymentConcepts.searchAsync(query)}
                                    />
                                )} />

                            {
                                (errors.paymentConceptId && !paymentConcept) && (
                                    <p className="error">
                                        El concepto de pago es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="control-container">
                            <label className="label">Monto de pago (MXN)<span className="required">*</span>:</label>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{
                                    required: true,
                                    validate: {
                                        integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                        nonNegative: (v) => v! >= 1 || "El monto de pago no puede ser menor o igual a 0",
                                    },
                                }}
                                disabled={disabled}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            type="number"
                                            className="pill-input w-full pl-8 pr-13"
                                            step={1}
                                            min={1}
                                            disabled={disabled}
                                            inputMode="numeric"
                                            placeholder="Monto de pago..."
                                            value={field.value ?? ""}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                            onKeyDown={(e) => { if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault(); }}
                                        />
                                    </div>
                                )} />
                            {
                                errors.amount && (
                                    <p className="error">
                                        {errors.amount.message || "El monto de pago es obligatorio"}
                                    </p>
                                )
                            }
                            <p className="text-xs text-muted-foreground mt-1.5">Solo valores enteros — sin decimales</p>
                        </div>
                        <div className="control-container">
                            <label className="label">Entre límite de pago <span className="required">*</span>:</label>
                            <Controller
                                name="dueDate"
                                control={control}
                                disabled={disabled}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        {...field}
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={disabled}
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
                                    disabled={disabled}
                                    render={({ field }) => (
                                        <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{field.value ? "Sí" : "No"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">El administrador podrá condonar este concepto por alumno según su ciclo escolar.</p>
                                            </div>
                                            <Switch disabled={disabled} checked={field.value ?? false} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Actions section */}
                    <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                        {
                            !isNewRecord &&
                            <Button type="button" aria-label="cancel" variant={"ghost"} onClick={() => setAcademicCycleWallet({})}>
                                Cancelar
                            </Button>
                        }
                        <Button type="submit">
                            {
                                isNewRecord ? "Agregar nuevo concepto" : "Actualizar concepto"
                            }
                        </Button>
                    </section>
                </section>
            </form>
        </>
    )
}
