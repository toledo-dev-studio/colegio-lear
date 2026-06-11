import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Modal } from "@/shared/components/modal/Modal";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import type { EducationLevel } from "@/interfaces/entites/education-level";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useCreateUpdateAcademicCycle } from "@/modules/academic-cycles/hooks/academic-cycles/useCreateUpdateAcademicCycle";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES, type AcademicCycle } from "@/interfaces/entites/academic-cycle";
import { useSearchEducationLevelsForAcademicLevel } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevelsForAcademicLevel";
import { SearchInput } from "@/shared/components/search-input/SearchInput";

export const AcademicCycleTab = () => {

    // Get context from layout
    const { academicCycle, isNew, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Hooks & stores
    const navigate = useNavigate();
    const [confirmationRequired, setConfirmationRequired] = useState<boolean>(false);
    const { showLoading, hideLoading } = useLoaderStore();
    const mutation = useCreateUpdateAcademicCycle();

    // Use hook form configuration
    const { control, register, handleSubmit, formState: { errors }, setValue, watch, setValues, getValues } = useForm<Partial<AcademicCycle>>({
        defaultValues: {
            ...academicCycle,
        }
    });
    const selectedAcademicLevel = watch("academicLevelId");
    const selectedEducationLevel = watch("educationLevelId");

    // Academic levels assign configuration
    const searchAcademicLevelsForSchoolSubject = useSearchAcademicLevels();

    // Education levels assign configuration
    const searchEducationLevelsForAcademicLevel = useSearchEducationLevelsForAcademicLevel();

    const validateAcademicCycleStatus = async (academicCycleLike: Partial<AcademicCycle>) => {
        if (academicCycleLike.status !== "upcoming" && !isLocked) {
            setConfirmationRequired(true);
            return;
        }
        await onSubmit(academicCycleLike);
    }

    const onSubmit = async (academicCycleLike: Partial<AcademicCycle>) => {
        try {
            showLoading("Guardando registro");
            await mutation.mutateAsync(academicCycleLike, {
                onSuccess: (response) => {
                    toast.success(isNew ? "Ciclo escolar creado correctamente" : "Ciclo escolar actualizado correctamente", { position: "top-right" });
                    hideLoading();
                    navigate(`/academic-cycles/${response.id}`);
                }
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error(isNew ? "Ocurrió un error al tratar de crear el ciclo escolar" : "Ocurrió un error al tratar de actualizar el ciclo escolar", { position: "top-right" });
        }
    }

    useEffect(() => setValues(academicCycle), [academicCycle]);

    return (
        <>
            {/* Academic cycle form */}
            <form onSubmit={handleSubmit(validateAcademicCycleStatus)}>

                {/* Main student information */}
                <section className="flex flex-col gap-y-6 mt-2">
                    <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            INFORMACIÓN GENERAL DEL CICLO ESCOLAR
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            En esta sección de la pantalla podrás configurar la información general de un ciclo escolar.
                        </p>
                    </div>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-2 block">Nombre del ciclo <span className="text-destructive">*</span>:</label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    {...register("name", { required: true })}
                                    placeholder="Nombre del ciclo..."
                                    className="pill-input w-full pl-8"
                                    disabled={isLocked}
                                />
                            </div>
                            {
                                errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-2 block">Código del ciclo <span className="text-destructive">*</span>:</label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    {...register("code", { required: true })}
                                    placeholder="Código del ciclo..."
                                    className="pill-input w-full pl-8"
                                    disabled={isLocked}
                                />
                            </div>
                            {
                                errors.code && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El código del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Tipo de periodo del ciclo escolar <span className="text-destructive">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name={"type"}
                                rules={{ required: true }}
                                disabled={isLocked}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger disabled={isLocked}>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {!field.value ? "Selecciona una opción" : ACADEMIC_CYCLE_PERIOD_TYPES.find(item => item.key === field.value)?.label}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Tipo de periodo</SelectLabel>
                                                {ACADEMIC_CYCLE_PERIOD_TYPES.map((item) => (
                                                    <SelectItem key={item.key} value={item.key} label={item.label}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {
                                errors.type && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El tipo de periodo del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-2 block">Nivel académico <span className="text-destructive">*</span>:</label>
                            <SearchInput
                                {...register("academicLevelId", { required: true })}
                                disabled={isLocked}
                                defaultValue={watch("academicLevel.name")}
                                selected={!!selectedAcademicLevel}
                                placeholder="Busqueda de nivel académico"
                                options={searchAcademicLevelsForSchoolSubject.academicLevels ?? []}
                                isSearching={searchAcademicLevelsForSchoolSubject.isPending}
                                onClearSelection={() => {
                                    setValue("academicLevelId", undefined);
                                    setValue("academicLevel.name", undefined);
                                    setValue("educationLevelId", undefined);
                                    setValue("educationLevel.name", undefined);
                                }}
                                onOptionChange={async (option: AcademicLevel) => {
                                    setValue("academicLevelId", option.id);
                                    setValue("academicLevel.name", option.name);
                                    searchAcademicLevelsForSchoolSubject.clearSearchResult();
                                }}
                                onSearch={async (query) => searchAcademicLevelsForSchoolSubject.searchAsync(query)}
                            />
                            {
                                (errors.academicLevelId && !selectedAcademicLevel) && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nivel académico es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-2 block">Nivel educativo <span className="text-destructive">*</span>:</label>
                            <SearchInput
                                {...register("educationLevelId", { required: true })}
                                defaultValue={watch("educationLevel.name")}
                                selected={!!selectedEducationLevel}
                                disabled={!selectedAcademicLevel || isLocked}
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
                            {
                                (errors.educationLevelId && !selectedEducationLevel) && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nivel educativo es obligatorio
                                    </p>
                                )
                            }
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-2 block">Entre fecha de inicio <span className="text-destructive">*</span>:</label>
                            <Controller
                                name="startDate"
                                control={control}
                                disabled={isLocked}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isLocked}
                                    />
                                )}
                            />
                            {
                                errors.startDate && (
                                    <p className="text-red-500 text-sm mt-2">
                                        La fecha de inicio del ciclo escolar es obligatoria
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-2 block">Hasta fecha de termino <span className="text-destructive">*</span>:</label>
                            <Controller
                                name="endDate"
                                control={control}
                                rules={{ required: true }}
                                disabled={isLocked}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isLocked}
                                    />
                                )}
                            />
                            {
                                errors.endDate && (
                                    <p className="text-red-500 text-sm mt-2">
                                        La fecha de termino del ciclo escolar es obligatoria
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Estado del ciclo escolar <span className="text-destructive">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name={"status"}
                                rules={{ required: true }}
                                disabled={isLocked}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger disabled={isLocked}>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {!field.value ? "Selecciona una opción" : ACADEMIC_CYCLE_STATUSES.find(item => item.key === field.value)?.label}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Estado del ciclo escolar</SelectLabel>
                                                {ACADEMIC_CYCLE_STATUSES.map((item) => (
                                                    <SelectItem key={item.key} value={item.key} label={item.label}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {
                                errors.status && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El estatus actual del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                ¿Inscripciones abiertas?:
                            </label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="enrollmentOpen"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                        <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{field.value ? "Inscripciones abiertas" : "Inscripciones cerradas"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Ciclo escolar con posibilidad de inscribir nuevos estudiantes.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="w-full col-span-1 md:col-span-2 xl:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-3 block">Observaciones adicionales:</label>
                            <Textarea
                                {...register("observations")}
                                placeholder="Observaciones..." />
                        </div>
                    </section>
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/students">
                        <Button type="button" disabled={mutation.isPending} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={mutation.isPending} aria-label="save-record">
                        Guardar
                        {
                            mutation.isPending && (<CustomSpinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

                {/* Save confirmation modal */}
                <Modal
                    open={confirmationRequired}
                    type="info"
                    title="¡Antes de continuar!"
                    message="Una vez que actualices el estatus del ciclo escolar y deje de ser 'Próximo' ya no podrás realizar ciertas configuraciones posteriores al registro, tales como configurar nuevas materias y/o modificar la cartera de pagos."
                    isLoading={false}
                    cancelButton={{
                        label: "Cancelar",
                        onClick: () => setConfirmationRequired(false)
                    }}
                    confirmButton={{
                        label: "Aceptar",
                        onClick: async () => {
                            setConfirmationRequired(false);
                            await onSubmit(getValues())
                        },
                    }}
                />
            </form>
        </>
    )
}
