import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Slider } from "@/shared/ui/slider";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
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
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<ScholarshipFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        searchParams.set("discount-percentage", `${filter.discountPercentage}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
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
                        <label className="label">Nombre de la beca:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    {...field}
                                    onKeyDown={(e) => e.code === "Enter" && e.preventDefault()}
                                    placeholder="Nombre de la beca..."
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
                                    <label className="switch-control-container">
                                        <div>
                                            <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="description">La beca escolar encuentra activa o inactiva.</p>
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
    )
}
