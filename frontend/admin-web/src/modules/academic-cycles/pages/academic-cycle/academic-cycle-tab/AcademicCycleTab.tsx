import { useEffect, useRef, useState } from "react";
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
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useCreateUpdateAcademicCycle } from "@/modules/academic-cycles/hooks/academic-cycles/useCreateUpdateAcademicCycle";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES, type AcademicCycle } from "@/interfaces/entites/academic-cycle";
import { useSearchEducationLevelsForAcademicLevel } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevelsForAcademicLevel";

export const AcademicCycleTab = () => {

    // Get context from layout
    const { academicCycle, isNew, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Components hooks & stores
    const navigate = useNavigate();
    const [confirmationRequired, setConfirmationRequired] = useState<boolean>(false);
    const { showLoading, hideLoading } = useLoaderStore();
    const createUpdateMutation = useCreateUpdateAcademicCycle();

    // Related entities hooks & stores
    const searchAcademicLevelsForSchoolSubject = useSearchAcademicLevels();
    const searchEducationLevelsForAcademicLevel = useSearchEducationLevelsForAcademicLevel();
    const academicLevelSearchInputRef = useRef<HTMLInputElement>(null);
    const educationLevelSearchInputRef = useRef<HTMLInputElement>(null);

    // Use hook form configuration
    const { control, handleSubmit, formState: { errors }, setValue, watch, getValues, reset } = useForm<Partial<AcademicCycle>>({
        defaultValues: {
            id: academicCycle?.id,
            name: academicCycle?.name ?? "",
            code: academicCycle?.code ?? "",
            startDate: academicCycle?.startDate ?? "",
            endDate: academicCycle?.endDate ?? "",
            observations: academicCycle?.observations ?? "",
            enrollmentOpen: academicCycle?.enrollmentOpen ?? undefined,
            type: academicCycle?.type ?? undefined,
            status: academicCycle?.status ?? "upcoming",
            academicLevelId: academicCycle?.academicLevelId ?? "",
            academicLevel: academicCycle?.academicLevel ?? undefined,
            educationLevelId: academicCycle?.educationLevelId ?? "",
            educationLevel: academicCycle?.educationLevel ?? undefined,
        }
    });
    const academicLevel = watch("academicLevel");
    const educationLevel = watch("educationLevel");

    // Component functions
    const onSubmit = async (academicCycleLike: Partial<AcademicCycle>) => {
        try {
            showLoading("Guardando registro");
            await createUpdateMutation.mutateAsync(academicCycleLike, {
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

    const onError = () => {
        if (errors.academicLevelId && !academicLevel?.id) {
            academicLevelSearchInputRef.current?.focus();
            return;
        }
        if (errors.educationLevelId && !educationLevel?.id) {
            educationLevelSearchInputRef.current?.focus();
            return;
        }
    }

    const validate = async (academicCycleLike: Partial<AcademicCycle>) => {
        if (academicCycleLike.status !== "upcoming" && !isLocked) {
            setConfirmationRequired(true);
            return;
        }
        await onSubmit(academicCycleLike);
    }

    useEffect(() => {
        requestAnimationFrame(() => {
            reset({
                id: academicCycle?.id,
                name: academicCycle?.name ?? "",
                code: academicCycle?.code ?? "",
                startDate: academicCycle?.startDate ?? "",
                endDate: academicCycle?.endDate ?? "",
                observations: academicCycle?.observations ?? "",
                enrollmentOpen: academicCycle?.enrollmentOpen ?? undefined,
                type: academicCycle?.type ?? undefined,
                status: academicCycle?.status ?? "upcoming",
                academicLevelId: academicCycle?.academicLevelId ?? "",
                academicLevel: academicCycle?.academicLevel ?? undefined,
                educationLevelId: academicCycle?.educationLevelId ?? "",
                educationLevel: academicCycle?.educationLevel ?? undefined,
            });
        })
    }, [academicCycle]);

    return (
        <>
            {/* Academic cycle form */}
            <form onSubmit={handleSubmit(validate, onError)}>

                {/* Main student information */}
                <section className="flex flex-col gap-y-6 mt-2">
                    <TabSectionTitle
                        title="INFORMACIÓN GENERAL DEL CICLO ESCOLAR"
                        description="En esta sección de la pantalla podrás configurar la información general de un ciclo escolar." />

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="control-container">
                            <label className="label">Nombre del ciclo <span className="required">*</span>:</label>
                            <Controller
                                control={control}
                                name="name"
                                rules={{ required: true }}
                                disabled={isLocked}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        disabled={isLocked}
                                        type="text"
                                        placeholder="Nombre del ciclo escolar..."
                                    />
                                )} />
                            {
                                errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="control-container">
                            <label className="label">Código del ciclo <span className="required">*</span>:</label>
                            <Controller
                                control={control}
                                name="code"
                                rules={{ required: true }}
                                disabled={isLocked}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        disabled={isLocked}
                                        type="text"
                                        placeholder="Código del ciclo escolar..."
                                    />
                                )} />
                            {
                                errors.code && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El código del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="control-container">
                            <label className="label">
                                Tipo de periodo del ciclo escolar <span className="required">*</span>:
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
                        <div className="control-container">
                            <label className="label">Entre fecha de inicio <span className="required">*</span>:</label>
                            <Controller
                                name="startDate"
                                control={control}
                                disabled={isLocked}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        {...field}
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
                        <div className="control-container">
                            <label className="label">Hasta fecha de termino <span className="required">*</span>:</label>
                            <Controller
                                name="endDate"
                                control={control}
                                rules={{ required: true }}
                                disabled={isLocked}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        {...field}
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
                        <div className="control-container">
                            <label className="label">
                                Estado del ciclo escolar <span className="required">*</span>:
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
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="control-container">
                            <label className="label">Nivel académico <span className="required">*</span>:</label>
                            <Controller
                                name="academicLevelId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchInput
                                        {...field}
                                        ref={academicLevelSearchInputRef}
                                        disabled={isLocked}
                                        defaultValue={academicLevel?.name}
                                        selected={!!academicLevel}
                                        placeholder="Busqueda de nivel académico"
                                        options={searchAcademicLevelsForSchoolSubject.academicLevels ?? []}
                                        isSearching={searchAcademicLevelsForSchoolSubject.isPending}
                                        onClearSelection={() => {
                                            setValue("academicLevelId", undefined);
                                            setValue("academicLevel", undefined);
                                            setValue("educationLevelId", undefined);
                                            setValue("educationLevel", undefined);
                                        }}
                                        onOptionChange={async (option: AcademicLevel) => {
                                            setValue("academicLevelId", option.id);
                                            setValue("academicLevel", option);
                                            searchAcademicLevelsForSchoolSubject.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchAcademicLevelsForSchoolSubject.searchAsync({ query })}
                                    />
                                )} />
                            {
                                (errors.academicLevelId && !academicLevel) && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nivel académico es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="control-container">
                            <label className="label">Nivel educativo <span className="required">*</span>:</label>
                            <Controller
                                name="educationLevelId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchInput
                                        {...field}
                                        ref={educationLevelSearchInputRef}
                                        defaultValue={educationLevel?.name}
                                        selected={!!educationLevel}
                                        disabled={!academicLevel || isLocked}
                                        placeholder="Busqueda de nivel educativo"
                                        options={searchEducationLevelsForAcademicLevel.educationLevels ?? []}
                                        isSearching={searchEducationLevelsForAcademicLevel.isPending}
                                        onClearSelection={() => {
                                            setValue("educationLevelId", undefined);
                                            setValue("educationLevel", undefined);
                                        }}
                                        onOptionChange={async (option: EducationLevel) => {
                                            setValue("educationLevelId", option.id);
                                            setValue("educationLevel", option);
                                            searchEducationLevelsForAcademicLevel.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchEducationLevelsForAcademicLevel.searchAsync({
                                            academicLevelId: academicLevel?.id!,
                                            query
                                        })}
                                    />
                                )} />
                            {
                                (errors.educationLevelId && !educationLevel) && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nivel educativo es obligatorio
                                    </p>
                                )
                            }
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-8">
                        <div className="control-container">
                            <label className="label">
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
                        <div className="control-container">
                            <label className="label">Observaciones adicionales:</label>
                            <Controller
                                name="observations"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        placeholder="-"
                                    />
                                )}
                            />
                        </div>
                    </section>
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/academic-cycles">
                        <Button type="button" disabled={createUpdateMutation.isPending} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={createUpdateMutation.isPending} aria-label="save-record">
                        Guardar
                        {
                            createUpdateMutation.isPending && (<CustomSpinner variant="primary" className="ml-4" />)
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
