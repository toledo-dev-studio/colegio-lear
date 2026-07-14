import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import type { AcademicLevelFilter } from "@/interfaces/filters/academic-level.filter";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const AcademicLevelsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const academicLevelFilterLike: Partial<AcademicLevelFilter> = {
        name: isValidValueWithDefault(searchParams.get("name"), ""),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active"))
    };

    // Use react hook form configuration
    const { control, handleSubmit, reset } = useForm<Partial<AcademicLevelFilter>>({
        defaultValues: academicLevelFilterLike
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("is-active");
        reset({
            name: "",
            isActive: true,
        });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<AcademicLevelFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
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
                        <label className="label">Nombre del nivel académico:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    {...field}
                                    placeholder="Nombre del nivel académico..."
                                />
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
                                            <p className="description">El concepto de pago se encuentra activo o inactivo.</p>
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
