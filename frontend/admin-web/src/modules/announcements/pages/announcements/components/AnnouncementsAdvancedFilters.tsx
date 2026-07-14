import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import type { AnnouncementFilter } from "@/interfaces/filters/announcement.filter";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const AnnouncementsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();

    const employeeFilterLike: Partial<AnnouncementFilter> = {
        name: isValidValueWithDefault(searchParams.get("name"), ""),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active")),
        expiresAt: isValidValueWithDefault(searchParams.get("expires-at"), ""),
        publishedAt: isValidValueWithDefault(searchParams.get("published-at"), ""),
    };

    // Use react hook form configuration
    const { control, handleSubmit, reset } = useForm<Partial<AnnouncementFilter>>({
        defaultValues: employeeFilterLike
    });


    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("is-active");
        searchParams.delete("published-at");
        searchParams.delete("expires-at");
        reset({
            name: "",
            publishedAt: "",
            expiresAt: "",
            isActive: true,
        });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<AnnouncementFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.publishedAt ? searchParams.set("published-at", filter.publishedAt) : searchParams.delete("published-at");
        filter.expiresAt ? searchParams.set("expires-at", filter.expiresAt) : searchParams.delete("expires-at");
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
                        <label className="label">Nombre de la campaña:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre de la campaña..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Entre fecha de publicación:</label>
                        <Controller
                            name="publishedAt"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <p className="control-info">Filtrado a partir de fecha de publicación seleccionada</p>
                    </div>

                    <div className="control-container">
                        <label className="label">Hasta fecha de vencimiento:</label>
                        <Controller
                            name="expiresAt"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <p className="control-info">Filtrado hasta fecha de vencimiento seleccionada</p>
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
                                            <p className="description">El registro de la camáña se encuentra activo o inactivo.</p>
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
