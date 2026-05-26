import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { Mail, Phone, User, X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import type { Student } from "@/interfaces/entites/student";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { isValidPhone } from "@/lib/extensions/validators";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const StudentsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    const [searchParams, setSearchParams] = useSearchParams();
    const studentsLikeFilter: Partial<Student> = {
        name: searchParams.get("name") ?? undefined,
        curp: searchParams.get("curp") ?? undefined,
        enrollment: searchParams.get("enrollment") ?? undefined,
        email: searchParams.get("email") ?? undefined,
        phoneNumber: searchParams.get("phone-number") ?? undefined,
        status: stringToBooleanWithDefault(searchParams.get("status"))
    };

    const {
        register,
        formState: { errors },
        handleSubmit,
        setValue,
        reset,
        watch
    } = useForm<Partial<Student>>({
        defaultValues: studentsLikeFilter
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("enrollment");
        searchParams.delete("curp");
        searchParams.delete("email");
        searchParams.delete("phone-number");
        searchParams.delete("status");
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<Student>) => {
        searchParams.set("status", `${filter.status}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.enrollment ? searchParams.set("enrollment", filter.enrollment) : searchParams.delete("enrollment");
        filter.curp ? searchParams.set("curp", filter.curp) : searchParams.delete("curp");
        filter.email ? searchParams.set("email", filter.email) : searchParams.delete("email");
        filter.phoneNumber ? searchParams.set("phone-number", filter.phoneNumber) : searchParams.delete("phone-number");
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
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Matrícula:</label>
                                <div className="relative">
                                    <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        {...register("enrollment")}
                                        placeholder="Matrícula..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre completo:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register("name")}
                                        placeholder="Nombre del estudiante..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">CURP:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register("curp")}
                                        placeholder="CURP del estudiante..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    Número de teléfono:
                                </label>
                                <div className="relative">
                                    <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        {...register("phoneNumber", { required: false, validate: (value) => !value ? true : isValidPhone(value) })}
                                        placeholder="+52 (55) 1234-5678"
                                        maxLength={10}
                                        className="pill-input w-full pl-8 pr-13" />
                                </div>
                                {
                                    errors.phoneNumber && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {errors.phoneNumber.message || "El número de teléfono del empleado es obligatorio"}
                                        </p>
                                    )
                                }
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    Correo electrónico:
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        {...register("email")}
                                        placeholder="usuario@dominio.com"
                                        className="pill-input w-full pl-8 pr-13" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Estatus:</label>
                                <Switch
                                    size="default"
                                    checked={watch("status")}
                                    onCheckedChange={(checked) => setValue("status", checked)} />
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
