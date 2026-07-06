import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Slider } from "@/shared/ui/slider";
import type { ScholarshipFilter } from "@/interfaces/filters/scholarship.filter";
import { isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const ScholarshipsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const scholarshipFilterLike: Partial<ScholarshipFilter> = {
        name: isValidValueWithDefault(searchParams.get("name"), ""),
        discountPercentage: stringToNumberWithDefault(searchParams.get("discount-percentage"), 0),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active"))
    };

    // Use react hook form configuration
    const { control, handleSubmit, watch, reset } = useForm<Partial<ScholarshipFilter>>({
        defaultValues: scholarshipFilterLike
    });
    const discountPercentage = watch("discountPercentage");

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("is-active");
        searchParams.delete("discount-percentage");
        reset({ name: "", isActive: true, discountPercentage: 0 }, { keepTouched: false });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<ScholarshipFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        searchParams.set("discount-percentage", `${filter.discountPercentage}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
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
                                <label className="label">Máximo de porcentaje de descuento ({discountPercentage ?? 1} %):</label>
                                <Controller
                                    name="discountPercentage"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center justify-center mt-0 md:mt-7">
                                            <Slider
                                                value={field.value ?? 1}
                                                min={0}
                                                max={100}
                                                step={1}
                                                onValueChange={(value) => field.onChange(value, { shouldTouch: true })}
                                            />
                                        </div>
                                    )}
                                />
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
                                                    <p className="text-xs text-muted-foreground mt-1">La beca escolar encuentra activa o inactiva.</p>
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
    )
}
