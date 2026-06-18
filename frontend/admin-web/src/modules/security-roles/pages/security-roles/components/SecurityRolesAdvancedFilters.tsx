import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import type { SecurityRoleFilter } from "@/interfaces/filters/security-role.filter";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const SecurityRolesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const securityRoleFilterLike: Partial<SecurityRoleFilter> = {
        name: isValidValueWithDefault(searchParams.get("name"), ""),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active"))
    };

    // Use react hook form configuration
    const { control, handleSubmit, reset } = useForm<Partial<SecurityRoleFilter>>({
        defaultValues: securityRoleFilterLike
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("is-active");
        reset({ name: "", isActive: true });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<SecurityRoleFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <form className="fixed inset-0 z-50 flex justify-end" onSubmit={handleSubmit(onSubmit)}>

                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />

                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">

                    <section className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            {title}
                        </h3>
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground !px-0">
                            <X className="!w-5 !h-5 text-muted-foreground" />
                        </Button>
                    </section>

                    <section className="flex-1 overflow-y-auto px-10 py-10 space-y-5">
                        <section className="flex flex-col gap-8">
                            <div className="control-container">
                                <label className="label">Nombre del rol de seguridad:</label>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            {...field}
                                            placeholder="Nombre del rol de seguridad..."
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
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">El rol de seguridad se encuentra activo o inactivo.</p>
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

            </form >
        </>
    );
}
