import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Modal } from "@/shared/components/modal/Modal";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { AcademicCycleRequest } from "@/interfaces/requests/academic-cycle.request";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import type { EducationLevelResponse } from "@/interfaces/responses/education-level.response";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import { type AcademicCycleStatusKey, type AcademicPeriodTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { useSearchEducationLevels } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevels";
import { useCreateUpdateAcademicCycle } from "@/modules/academic-cycles/hooks/academic-cycles/useCreateUpdateAcademicCycle";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { BookOpenCheck, ClipboardCheck } from "lucide-react";

export const AcademicCycleTab = () => {
    // Context from layout
    const { academicCycle, isNew, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Constant configuration variables
    const ACADEMIC_CYCLE_STATUSES_LIST = !isLocked
        ? ACADEMIC_CYCLE_STATUSES.filter(item => item.key === "upcoming" || item.key === "active")
        : ACADEMIC_CYCLE_STATUSES.filter(item => item.key !== "upcoming");

    // Component hooks & stores
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoaderStore();
    const createUpdateAcademicCycleMutation = useCreateUpdateAcademicCycle();
    const [confirmationRequired, setConfirmationRequired] = useState<boolean>(false);
    const searchAcademicLevels = useSearchAcademicLevels();
    const searchEducationLevels = useSearchEducationLevels();

    // Use hook form configuration
    const { control, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm<Partial<AcademicCycleRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(academicCycle?.name, ""),
            code: isValidValueWithDefault(academicCycle?.code, ""),
            periodType: isValidValueWithDefault(academicCycle?.periodType as AcademicPeriodTypeKey, undefined),
            status: isValidValueWithDefault(academicCycle?.status as AcademicCycleStatusKey, "upcoming"),
            evaluationCount: isValidValueWithDefault(academicCycle?.evaluationCount, 3),
            minimumPassingGrade: isValidValueWithDefault(academicCycle?.minimumPassingGrade, 6),
            startDate: isValidValueWithDefault(academicCycle?.startDate, ""),
            endDate: isValidValueWithDefault(academicCycle?.endDate, ""),
            observations: isValidValueWithDefault(academicCycle?.observations, ""),
            enrollmentOpen: isValidValueWithDefault(academicCycle?.enrollmentOpen, false),
            academicLevelId: isValidValueWithDefault(academicCycle?.academicLevelId, ""),
            academicLevel: isValidValueWithDefault(academicCycle?.academicLevel, undefined),
            educationLevelId: isValidValueWithDefault(academicCycle?.educationLevelId, ""),
            educationLevel: isValidValueWithDefault(academicCycle?.educationLevel, undefined),
        }
    });
    const academicLevel = watch("academicLevel");
    const academicLevelId = watch("academicLevelId");
    const educationLevel = watch("educationLevel");
    const educationLevelId = watch("educationLevelId");

    // Component functions && constants
    const onSubmit = async (academicCycleRequestLike: Partial<AcademicCycleRequest>) => {
        try {
            showLoading("Guardando registro");
            await createUpdateAcademicCycleMutation.mutateAsync({ id: isNew ? "new" : academicCycle?.id!, academicCycleRequestLike }, {
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

    const validateForm = async (academicCycleRequestLike: Partial<AcademicCycleRequest>) => {
        if (academicCycleRequestLike.status !== "upcoming" && !isLocked) {
            setConfirmationRequired(true);
            return;
        }
        await onSubmit(academicCycleRequestLike);
    }

    return (
        <>
            <form onSubmit={handleSubmit(validateForm)}>

                <section className="flex flex-col gap-y-6">

                    <SectionTitle
                        title="INFORMACIÓN GENERAL DEL CICLO ESCOLAR"
                        description="En esta sección de la pantalla podrás configurar la información general de un ciclo escolar." />

                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">

                        <div className="control-container">
                            <label className="label">Nombre del ciclo <span className="required">*</span>:</label>
                            <Controller
                                name="name"
                                control={control}
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
                                    <p className="error">
                                        El nombre del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Código del ciclo <span className="required">*</span>:</label>
                            <Controller
                                name="code"
                                control={control}
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
                                    <p className="error">
                                        El código del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">
                                Tipo de periodo <span className="required">*</span>:
                            </label>
                            <Controller
                                name="periodType"
                                control={control}
                                rules={{ required: true }}
                                disabled={isLocked}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger disabled={isLocked}>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {labelOf(ACADEMIC_CYCLE_PERIOD_TYPES, field.value) || "Selecciona una opción"}
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
                                errors.periodType && (
                                    <p className="error">
                                        El tipo de periodo del ciclo escolar es obligatorio
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
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {labelOf(ACADEMIC_CYCLE_STATUSES_LIST, field.value) || "Selecciona una opción"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Estado del ciclo escolar</SelectLabel>
                                                {ACADEMIC_CYCLE_STATUSES_LIST.map((item) => (
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
                                    <p className="error">
                                        El estatus actual del ciclo escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Minima calf. aprobatoria <span className="required">*</span>:</label>
                            <Controller
                                name="minimumPassingGrade"
                                control={control}
                                disabled={isLocked}
                                rules={{
                                    required: true,
                                    validate: {
                                        integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                        nonNegative: (v) => v! > 0 || "La calificación no puede ser negativa o cero",
                                        maximum: (v) => v! <= 10 || "La calificación no puede ser mayor a 10",
                                    },
                                }}
                                render={({ field }) => (
                                    <div className="relative">
                                        <ClipboardCheck className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            disabled={isLocked}
                                            step={1}
                                            min={1}
                                            inputMode="numeric"
                                            type="number"
                                            placeholder="10"
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", ".", ","].includes(e.key))
                                                    e.preventDefault();
                                            }}
                                            onChange={(e) => e.target.value ? field.onChange(e.target.valueAsNumber) : field.onChange("")}
                                        />
                                    </div>
                                )}
                            />
                            <p className="control-info">Calificación minima por ciclo y materia (Solo valores enteros — sin decimales)</p>
                            {
                                errors.minimumPassingGrade && (
                                    <p className="error">
                                        {errors.minimumPassingGrade.message || "La calificación mínima es obligatoria"}
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Número de evaluaciones <span className="required">*</span>:</label>
                            <Controller
                                name="evaluationCount"
                                control={control}
                                disabled={isLocked}
                                rules={{
                                    required: true,
                                    validate: {
                                        integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                        nonNegative: (v) => v! > 0 || "El número de evaluaciones no puede ser negativo o cero",
                                        maximum: (v) => v! <= 10 || "El número de evaluaciones no puede ser mayor a 10",
                                    },
                                }}
                                render={({ field }) => (
                                    <div className="relative">
                                        <BookOpenCheck className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            step={1}
                                            min={1}
                                            disabled={isLocked}
                                            inputMode="numeric"
                                            type="number"
                                            placeholder="10"
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", ".", ","].includes(e.key))
                                                    e.preventDefault();
                                            }}
                                            onChange={(e) => e.target.value ? field.onChange(e.target.valueAsNumber) : field.onChange("")}
                                        />
                                    </div>
                                )}
                            />
                            <p className="control-info">Evaluaciones durante el ciclo (Solo valores enteros — sin decimales)</p>
                            {
                                errors.evaluationCount && (
                                    <p className="error">
                                        {errors.evaluationCount.message || "El número de evaluaciones es obligatorio"}
                                    </p>
                                )
                            }
                        </div>

                    </section>

                    <SectionTitle
                        title="DETALLES DE ADMINISTRACIÓN DEL CICLO ESCOLAR"
                        description="Configura la duración del ciclo escolar, así como el nivel académico y educativo al que irá dirigido." />

                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">

                        <div className="control-container">
                            <label className="label">Entre fecha de inicio <span className="required">*</span>:</label>
                            <Controller
                                name="startDate"
                                control={control}
                                disabled={isLocked}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        disabled={isLocked}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {
                                errors.startDate && (
                                    <p className="error">
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
                                    <DatePicker
                                        {...field}
                                        disabled={isLocked}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {
                                errors.endDate && (
                                    <p className="error">
                                        La fecha de termino del ciclo escolar es obligatoria
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Nivel académico <span className="required">*</span>:</label>
                            <Controller
                                name="academicLevelId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchInput
                                        {...field}
                                        disabled={isLocked || !isNew}
                                        defaultValue={academicLevel?.name}
                                        selected={!!academicLevelId}
                                        placeholder="Busqueda de nivel académico"
                                        options={searchAcademicLevels.academicLevels}
                                        isSearching={searchAcademicLevels.isPending}
                                        onClearSelection={() => {
                                            setValue("academicLevel", undefined);
                                            setValue("academicLevelId", undefined);
                                            setValue("educationLevel", undefined);
                                            setValue("educationLevelId", undefined);
                                            searchAcademicLevels.clearSearchResult();
                                        }}
                                        onOptionChange={async (option: AcademicLevelResponse) => {
                                            setValue("academicLevel", option);
                                            setValue("academicLevelId", option.id);
                                            searchAcademicLevels.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchAcademicLevels.searchAsync({ query, isActive: true })}
                                    />
                                )}
                            />
                            {
                                (errors.academicLevelId && !academicLevel) && (
                                    <p className="error">
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
                                        disabled={!academicLevelId || isLocked || !isNew}
                                        defaultValue={educationLevel?.name}
                                        selected={!!educationLevelId}
                                        placeholder="Busqueda de nivel educativo"
                                        options={searchEducationLevels.educationLevels}
                                        isSearching={searchEducationLevels.isPending}
                                        onClearSelection={() => {
                                            setValue("educationLevel", undefined);
                                            setValue("educationLevelId", undefined);
                                            searchEducationLevels.clearSearchResult();
                                        }}
                                        onOptionChange={async (option: EducationLevelResponse) => {
                                            setValue("educationLevel", option);
                                            setValue("educationLevelId", option.id);
                                            searchEducationLevels.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchEducationLevels.searchAsync({ academicLevelId, query, isActive: true })}
                                    />
                                )} />
                            {
                                (errors.educationLevelId && !educationLevel) && (
                                    <p className="error">
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
                                        <label className="switch-control-container">
                                            <div>
                                                <p className="label">{field.value ? "Inscripciones abiertas" : "Inscripciones cerradas"}</p>
                                                <p className="description">Ciclo escolar con posibilidad de inscribir nuevos estudiantes.</p>
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
                        <Button type="button" disabled={createUpdateAcademicCycleMutation.isPending} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={createUpdateAcademicCycleMutation.isPending} aria-label="save-record">
                        Guardar
                        {
                            createUpdateAcademicCycleMutation.isPending && (<Spinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

                {/* Save confirmation modal */}
                <Modal
                    open={confirmationRequired}
                    type="info"
                    title="¡Antes de continuar!"
                    message={`Al continuar, el ciclo escolar comenzará a estar en estado de "En Curso". Después de este cambio ya no podrás agregar nuevas materias ni modificar la cartera de pagos, ya que el sistema generará automáticamente la configuración correspondiente para los alumnos inscritos. ¿Deseas continuar?`}
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
