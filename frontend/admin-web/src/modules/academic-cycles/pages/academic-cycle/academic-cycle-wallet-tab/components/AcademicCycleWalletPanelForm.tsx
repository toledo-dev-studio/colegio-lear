import { useState } from "react";
import { useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Banknote } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";
import { useSearchPaymentConcepts } from "@/modules/payment-concepts/hooks/useSearchPaymentConcepts";
import type { AcademicCycleWalletItemRequest } from "@/interfaces/requests/academic-cycle-wallet-item.request";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

interface Props {
    academicCycleWalletItemResponse?: Partial<AcademicCycleWalletItemResponse>;
    handleClickClose: () => void;
    onSubmit: (academicCycleWalletItemRequestLike: Partial<AcademicCycleWalletItemRequest>) => void;
}

export const AcademicCycleWalletPanelForm = ({ academicCycleWalletItemResponse, handleClickClose, onSubmit }: Props) => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Component hooks & stores
    const [selectedPaymentConcept, setSelectedPaymentConcept] = useState<PaymentConceptResponse>();
    const searchPaymentConcepts = useSearchPaymentConcepts();

    // Use hook form configuration
    const { control, handleSubmit, formState: { errors }, setValue } = useForm<Partial<AcademicCycleWalletItemRequest>>({
        defaultValues: {
            academicCycleId: academicCycleId,
            name: isValidValueWithDefault(academicCycleWalletItemResponse?.name, ""),
            description: isValidValueWithDefault(academicCycleWalletItemResponse?.description, ""),
            amount: isValidValueWithDefault(academicCycleWalletItemResponse?.amount, 0),
            dueDate: isValidValueWithDefault(academicCycleWalletItemResponse?.dueDate, ""),
            allowForgiveness: isValidValueWithDefault(academicCycleWalletItemResponse?.allowForgiveness, false),
        }
    });

    return (
        <>
            <SidePanel
                title="ASOCIACIÓN DE CONCEPTO"
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickClose }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>

                <form className="flex flex-col gap-8">

                    <div className="control-container border-b pb-8">
                        <label className="label">Llenado por búsqueda de concepto:</label>
                        <SearchInput
                            defaultValue={selectedPaymentConcept?.name}
                            selected={!!selectedPaymentConcept}
                            placeholder="Busqueda de concepto de pago"
                            options={searchPaymentConcepts.paymentConcepts ?? []}
                            isSearching={searchPaymentConcepts.isPending}
                            onClearSelection={() => {
                                setSelectedPaymentConcept(undefined);
                                setValue("name", "");
                                setValue("description", "");
                                setValue("amount", 0);
                                setValue("allowForgiveness", false);
                            }}
                            onOptionChange={async (option: PaymentConceptResponse) => {
                                setSelectedPaymentConcept(option);
                                setValue("name", option.name)
                                setValue("description", option.description);
                                setValue("amount", option.amount);
                                setValue("allowForgiveness", option.allowForgiveness);
                                searchPaymentConcepts.clearSearchResult();
                            }}
                            onSearch={async (query) => searchPaymentConcepts.searchAsync({ query, isActive: true })}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Nombre del concepto de pago <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre del concepto de pago"
                                />
                            )}
                        />
                        {
                            errors.name && (
                                <p className="error">
                                    Nombre del concepto de pago
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
                        <label className="label">Fecha límite de pago <span className="required">*</span>:</label>
                        <Controller
                            name="dueDate"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    value={field.value}
                                    onChange={field.onChange}
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
                                render={({ field }) => (
                                    <label className="switch-control-container">
                                        <div>
                                            <p className="label">{field.value ? "Permitido" : "No permitido"}</p>
                                            <p className="description">El concepto de pago permite la condonación del pago.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>

                    <div className="control-container">
                        <label className="label">Descripción:</label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>

                </form>

            </SidePanel>
        </>
    )
}
