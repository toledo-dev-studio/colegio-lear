import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { stringToBooleanWithDefault } from "@/lib/utils";
import type { Announcement } from "@/interfaces/entites/announcement";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const AnnouncementsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    // Main hooks
    const [searchParams, setSearchParams] = useSearchParams();

    // Form config
    const {
        control,
        register,
        handleSubmit,
        reset,
    } = useForm<Partial<Announcement>>({
        defaultValues: {
            name: searchParams.get('name') ?? undefined,
            publishedAt: searchParams.get('published-at') ?? undefined,
            expiresAt: searchParams.get('expires-at') ?? undefined,
            status: stringToBooleanWithDefault(searchParams.get('status')),
        }
    });


    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete('query');
        searchParams.delete('name');
        searchParams.delete('status');
        reset({
            name: undefined,
            status: true,
        });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<Announcement>) => {
        searchParams.delete('query');
        searchParams.set('status', `${filter.status}`);
        filter.name ? searchParams.set('name', filter.name) : searchParams.delete('name');
        filter.publishedAt ? searchParams.set('published-at', filter.publishedAt) : searchParams.delete('published-at');
        filter.expiresAt ? searchParams.set('expires-at', filter.expiresAt) : searchParams.delete('expires-at');
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
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre de la campaña:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register('name')}
                                        placeholder="Nombre de la campaña..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Entre fecha de publicación:</label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        {...register('publishedAt')}
                                        placeholder="Fecha de publicación..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">Filtrado a partir de fecha de publicación seleccionada</p>
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Hasta fecha de vencimiento:</label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        {...register('expiresAt')}
                                        placeholder="Fecha de vencimiento..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">Filtrado hasta fecha de vencimiento seleccionada</p>
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
