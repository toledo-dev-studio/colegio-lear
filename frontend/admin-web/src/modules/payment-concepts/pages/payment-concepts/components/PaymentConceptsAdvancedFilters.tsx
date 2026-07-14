import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Banknote } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import type { PaymentConceptFilter } from "@/interfaces/filters/payment-concept.filter";
import { isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const PaymentConceptsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const paymentConceptFilterLike: Partial<PaymentConceptFilter> = {
        name: isValidValueWithDefault(searchParams.get("name"), ""),
        amount: stringToNumberWithDefault(searchParams.get("amount"), ""),
        allowForgiveness: stringToBooleanWithDefault(searchParams.get("allow-forgiveness")),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active"))
    };

    // Use react hook form configuration
    const { control, formState: { errors }, handleSubmit, reset } = useForm<Partial<PaymentConceptFilter>>({
        defaultValues: paymentConceptFilterLike
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("amount");
        searchParams.delete("is-active");
        searchParams.delete("allow-forgiveness");
        reset({
            name: "",
            amount: undefined,
            isActive: true,
            allowForgiveness: true
        });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<PaymentConceptFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        searchParams.set("allow-forgiveness", `${filter.allowForgiveness}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.amount ? searchParams.set("amount", `${filter.amount}`) : searchParams.delete("amount");
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <SidePanel
                title={title}
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Limpiar filtros", handleClick: handleClickClearFilters }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Aplicar filtros", handleClick: handleSubmit(onSubmit) }}>

                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Nombre del concepto de pago:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    {...field}
                                    placeholder="Nombre del concepto de pago..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Máximo monto de pago (MXN):</label>
                        <Controller
                            name="amount"
                            control={control}
                            rules={{
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
                                    {errors.amount.message}
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">¿Registro activo?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <label className="switch-control-container">
                                        <div>
                                            <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="description">El concepto de pago se encuentra activo o inactivo.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
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

                </form>

            </SidePanel>
        </>
    );
}
