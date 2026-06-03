import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { CustomSearchInput } from "@/shared/components/CustomSearchInput";
import type { EducationLevel } from "@/interfaces/entites/education-level";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import { useSearchEducationLevelsForAcademicLevel } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevelsForAcademicLevel";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const SchoolSubjectsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    // Main hooks
    const [searchParams, setSearchParams] = useSearchParams();

    // Form config
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch
    } = useForm<Partial<SchoolSubject>>({
        defaultValues: {
            name: searchParams.get('name') ?? '',
            status: stringToBooleanWithDefault(searchParams.get('status')),
            academicLevelId: searchParams.get('academic-level-id') ?? undefined,
            academicLevel: {
                name: searchParams.get('academic-level-name') ?? undefined,
            },
            educationLevelId: searchParams.get('education-level-id') ?? undefined,
            educationLevel: {
                name: searchParams.get('education-level-name') ?? undefined,
            }
        }
    });
    const selectedAcademicLevel = watch('academicLevelId');
    const selectedEducationLevel = watch("educationLevelId");

    // Academic levels assign configuration
    const searchAcademicLevels = useSearchAcademicLevels();

    // Education levels assign configuration
    const searchEducationLevelsForAcademicLevel = useSearchEducationLevelsForAcademicLevel();

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete('query');
        searchParams.delete('name');
        searchParams.delete('status');
        searchParams.delete('academic-level-id');
        searchParams.delete('academic-level-name');
        searchParams.delete('education-level-id');
        searchParams.delete('education-level-name');
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<SchoolSubject>) => {
        searchParams.set('status', `${filter.status}`);
        filter.name ? searchParams.set('name', filter.name) : searchParams.delete('name');
        filter.academicLevelId ? searchParams.set('academic-level-id', filter.academicLevelId) : searchParams.delete('academic-level-id');
        filter.academicLevel?.name ? searchParams.set('academic-level-name', filter.academicLevel.name) : searchParams.delete('academic-level-name');
        filter.educationLevelId ? searchParams.set('education-level-id', filter.educationLevelId) : searchParams.delete('education-level-id');
        filter.educationLevel?.name ? searchParams.set('education-level-name', filter.educationLevel?.name) : searchParams.delete('education-level-name');
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
                                        placeholder="Nombre de la materia escolar..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nivel académico:</label>
                                <CustomSearchInput
                                    {...register("academicLevelId")}
                                    defaultValue={watch("academicLevel.name")}
                                    selected={!!selectedAcademicLevel}
                                    placeholder="Busqueda de nivel académico"
                                    options={searchAcademicLevels.academicLevels ?? []}
                                    isSearching={searchAcademicLevels.isPending}
                                    onClearSelection={() => {
                                        setValue("academicLevelId", undefined);
                                        setValue("academicLevel.name", undefined);
                                        setValue("educationLevelId", undefined);
                                        setValue("educationLevel.name", undefined);
                                    }}
                                    onOptionChange={async (option: AcademicLevel) => {
                                        setValue("academicLevelId", option.id);
                                        setValue("academicLevel.name", option.name);
                                        searchAcademicLevels.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchAcademicLevels.searchAsync(query)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nivel educativo:</label>
                                <CustomSearchInput
                                    {...register("educationLevelId")}
                                    defaultValue={watch("educationLevel.name")}
                                    selected={!!selectedEducationLevel}
                                    disabled={!selectedAcademicLevel}
                                    placeholder="Busqueda de nivel educativo"
                                    options={searchEducationLevelsForAcademicLevel.educationLevels ?? []}
                                    isSearching={searchEducationLevelsForAcademicLevel.isPending}
                                    onClearSelection={() => {
                                        setValue("educationLevelId", undefined);
                                        setValue("educationLevel.name", undefined);
                                    }}
                                    onOptionChange={async (option: EducationLevel) => {
                                        setValue("educationLevelId", option.id);
                                        setValue("educationLevel.name", option.name);
                                        searchEducationLevelsForAcademicLevel.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchEducationLevelsForAcademicLevel.searchAsync({
                                        academicLevelId: selectedAcademicLevel!,
                                        query
                                    })}
                                />
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