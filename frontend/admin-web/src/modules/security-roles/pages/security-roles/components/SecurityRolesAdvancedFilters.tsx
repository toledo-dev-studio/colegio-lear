import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { stringToBooleanWithDefault } from "@/lib/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const SecurityRolesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    const [searchParams, setSearchParams] = useSearchParams();
    const securityRoleLikeFilter: Partial<SecurityRole> = {
        name: searchParams.get('name') ?? '',
        status: stringToBooleanWithDefault(searchParams.get('status'))
    };

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch
    } = useForm<Partial<SecurityRole>>({
        defaultValues: securityRoleLikeFilter
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete('query');
        searchParams.delete('name');
        searchParams.delete('status');
        reset({ name: '', status: true });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<SecurityRole>) => {
        searchParams.set('status', `${filter.status}`);
        filter.name ? searchParams.set('name', filter.name) : searchParams.delete('name');
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
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register('name')}
                                        placeholder="Nombre del rol de seguridad..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Estatus:</label>
                                <Switch
                                    size="default"
                                    checked={watch('status')}
                                    onCheckedChange={(checked) => setValue('status', checked)} />
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
