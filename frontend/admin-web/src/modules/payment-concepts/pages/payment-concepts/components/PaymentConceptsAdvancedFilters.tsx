import { Banknote, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
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
    const { control, formState: { errors }, handleSubmit, getValues, reset } = useForm<Partial<PaymentConceptFilter>>({
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

    const handleSubmitForm = (filter: Partial<PaymentConceptFilter>) => {
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
            <form onSubmit={handleSubmit(handleSubmitForm, () => {
                console.log(getValues());
            })} className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">

                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />

                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">

                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            {title}
                        </h3>
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground !px-0">
                            <X className="!w-5 !h-5 text-muted-foreground" />
                        </Button>
                    </div>

                    <section className="flex-1 overflow-y-auto px-10 py-10 space-y-5">
                        <section className="flex flex-col gap-8">
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
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </div>
                                    )}
                                />
                                <p className="text-xs text-muted-foreground mt-1.5">Solo valores enteros — sin decimales</p>
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
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">El concepto de pago se encuentra activo o inactivo.</p>
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
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Permitido" : "No permitido"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">El concepto de pago permite la condonación del pago.</p>
                                                </div>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>

                        </section>

                    </section>

                    <section className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button type="button" variant={"ghost"} onClick={handleClickClearFilters}>
                            Limpiar filtros
                        </Button>
                        <Button type="submit" variant={"default"}>
                            Aplicar filtros
                        </Button>
                    </section>

                </aside>
            </form>
        </>
    );
}
