import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/shadcn/ui/input";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import type { AnnouncementFilter } from "@/interfaces/filters/announcement.filter";
import { ANNOUNCEMENTS_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AnnouncementsStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";

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
        status: isValidValueWithDefault(searchParams.get("status") as AnnouncementsStatusKey, undefined),
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
        searchParams.delete("status");
        searchParams.delete("published-at");
        searchParams.delete("expires-at");
        reset({
            name: "",
            publishedAt: "",
            expiresAt: "",
            status: undefined,
        });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<AnnouncementFilter>) => {
        searchParams.delete("query");
        filter.status ? searchParams.set("status", filter.status) : searchParams.delete("status");
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
                                    onKeyDown={(e) => e.code === "Enter" && e.preventDefault()}
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
                                    placeholder="Fecha de publicación"
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
                                    placeholder="Fecha de vencimiento"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <p className="control-info">Filtrado hasta fecha de vencimiento seleccionada</p>
                    </div>

                    <div className="control-container">
                        <label className="label">
                            Estado de la campaña:
                        </label>
                        <Controller
                            control={control}
                            name={"status"}
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una opción">
                                            {labelOf(ANNOUNCEMENTS_STATUSES, field.value) || "Selecciona una opción"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Estado de la campaña</SelectLabel>
                                            {ANNOUNCEMENTS_STATUSES.map((item) => (
                                                <SelectItem key={item.key} value={item.key} label={item.label}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                </form>

            </SidePanel>
        </>
    );
}
