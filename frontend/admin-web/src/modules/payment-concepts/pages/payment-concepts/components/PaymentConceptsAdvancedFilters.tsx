import { Banknote, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const PaymentConceptsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    // Main hooks
    const [searchParams, setSearchParams] = useSearchParams();

    // Form config
    const {
        control,
        register,
        handleSubmit,
        reset,
    } = useForm<Partial<PaymentConcept>>({
        defaultValues: {
            name: searchParams.get('name') ?? undefined,
            amount:  isNaN(+searchParams.get('amount')!) ? undefined : Number(searchParams.get('amount')),
            status: stringToBooleanWithDefault(searchParams.get('status')),
            allowForgiveness: stringToBooleanWithDefault(searchParams.get('allowForgiveness')),
        }
    });


    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete('query');
        searchParams.delete('name');
        searchParams.delete('amount');
        searchParams.delete('status');
        searchParams.delete('allowForgiveness');
        reset({
            name: undefined,
            amount: undefined,
            status: true,
            allowForgiveness: true
        });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<PaymentConcept>) => {
        searchParams.delete('query');
        searchParams.set('status', `${filter.status}`);
        searchParams.set('allowForgiveness', `${filter.allowForgiveness}`);
        filter.name ? searchParams.set('name', filter.name) : searchParams.delete('name');
        filter.amount ? searchParams.set('amount', `${filter.amount}`) : searchParams.delete('amount');
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">
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
                    <div className="flex-1 overflow-y-auto px-10 py-10 space-y-5">

                        {/* Contenido de filtrados */}
                        <div className="flex flex-col gap-8">
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre del concepto de pago:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register('name')}
                                        placeholder="Nombre del concepto de pago..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    Máximo de monto de pago (MXN)<span className="text-destructive">*</span>:
                                </label>
                                <div className="relative">
                                    <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pill-input w-full pl-8 pr-13"
                                        step={1}
                                        min={0}
                                        inputMode="numeric"
                                        placeholder="0"
                                        onKeyDown={(e) => { if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault(); }}
                                        {...register("amount", {
                                            valueAsNumber: true,
                                            validate: {
                                                integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                                nonNegative: (v) => v! >= 0 || "El monto de pago no puede ser negativo",
                                            },
                                        })}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">Solo valores enteros — sin decimales</p>
                            </div>

                            <div className="w-full">
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="w-full">
                                            <label className="text-sm font-medium text-foreground mb-2 block">Estatus del registro:</label>
                                            <Switch
                                                size="default"
                                                checked={field.value}
                                                onCheckedChange={field.onChange} />
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="w-full">
                                <Controller
                                    name="allowForgiveness"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="w-full">
                                            <label className="text-sm font-medium text-foreground mb-2 block">¿Condonación permitida?:</label>
                                            <Switch
                                                size="default"
                                                checked={field.value}
                                                onCheckedChange={field.onChange} />
                                        </div>
                                    )}
                                />
                            </div>

                        </div>
                    </div>
                    <div className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button
                            type="button"
                            variant={"destructive"}
                            data-testid="filter-clear-button"
                            className="pill-btn-outline px-10"
                            onClick={handleClickClearFilters}>
                            Limpiar filtros
                        </Button>
                        <Button
                            type="submit"
                            data-testid="filter-apply-button"
                            className="pill-btn-primary px-10">
                            Aplicar filtros
                        </Button>
                    </div>
                </aside>
            </form>
        </>
    );
}
