import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { EducationLevelGrid, type AvailableEducationLevel } from "./EducationLevelGrid";
import type { AcademicLevelRequest } from "@/interfaces/requests/academic-level.request";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";

interface Props {
    isNew: boolean;
    isSubmitting: boolean;
    academicLevelResponse?: AcademicLevelResponse;
    onSubmit: (academicLevelRequestLike: Partial<AcademicLevelRequest>) => void
}

export const AcademicLevelForm = ({ isNew, isSubmitting, academicLevelResponse, onSubmit }: Props) => {

    const { control, handleSubmit, formState: { errors }, getValues, setValue, watch } = useForm<Partial<AcademicLevelRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(academicLevelResponse?.name, ""),
            isActive: isValidValueWithDefault(academicLevelResponse?.isActive, false),
            description: isValidValueWithDefault(academicLevelResponse?.description, ""),
            educationLevels: isValidValueWithDefault(academicLevelResponse?.educationLevels, [])
        }
    });
    const educationLevels = watch("educationLevels") as AvailableEducationLevel[];

    const handleAddEducationLevel = () => {
        const current = (getValues("educationLevels") ?? [])
            .map((item) => ({ ...item, isEditing: false })) as AvailableEducationLevel[]; // Cerramos los formularios
        const newElement: AvailableEducationLevel = {
            id: `new-${current.length + 1}`,
            name: `Grado educativo - ${current.length + 1}`,
            description: "",
            isEditing: true,
            academicLevelId: getValues("id") ?? "new"
        };
        setValue("educationLevels", [...current, newElement]);
    }

    const handleRemoveEducationLevel = (id: string) => {
        const current = (getValues("educationLevels") ?? [])
            .map((item) => ({ ...item, isEditing: false }))
            .filter((item) => item.id !== id) as AvailableEducationLevel[]; // Cerramos los formularios;
        setValue("educationLevels", current);
    }

    const handleToggleEditEducationLevel = (id: string, isEditing: boolean) => {
        if (isEditing) {
            const current = (getValues("educationLevels") ?? [])
                .map((item) => ({ ...item, isEditing: item.id === id })) as AvailableEducationLevel[]; // Cerramos los formularios
            setValue("educationLevels", current);
        } else {
            const current = (getValues("educationLevels") ?? [])
                .map((item) => ({ ...item, isEditing: false })) as AvailableEducationLevel[]; // Cerramos los formularios
            setValue("educationLevels", current);
        }
    }

    const handleChangeEducationLevel = (id: string, field: "name" | "description", value: string) => {
        const current = (getValues("educationLevels") ?? []) as AvailableEducationLevel[];
        setValue("educationLevels", current.map((grade) =>
            grade.id === id ? { ...grade, [field]: value } : grade
        ));
    }


    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                {/* Academic level section */}
                <SectionTitle
                    title="INFORMACIÓN GENERAL DEL NIVEL ACADÉMICO"
                    description="Registro de información básica del nivel académico." />

                <section className="grid grid-cols-1 gap-8">

                    <div className="control-container">
                        <label className="label">Nombre del nivel académico <span className="required">*</span>:</label>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre del nivel académico..."
                                />
                            )} />
                        {
                            errors.name && (
                                <p className="error">
                                    El nombre del nivel académico es obligatorio
                                </p>
                            )
                        }
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
                                            <p className="text-xs text-muted-foreground mt-1">El concepto de pago se encuentra activo o inactivo.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>

                    <div className="control-container">
                        <label className="label">Descripción del nivel académico:</label>
                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>

                </section>

                {/* Education levels section */}
                <section className="grid grid-cols-1 gap-8">
                    { isNew && <CardAlert type="info" title="REGISTRO DE GRADOS ESCOLARES" message="Una vez que guardes la información básica correspondiente al nivel académico podrás configurar los grados escolares diponibles para el mismo." /> }
                    {
                        !isNew && (
                            <>
                                <SectionTitle
                                    title="INFORMACIÓN DE GRADOS ESCOLARES DISPONIBLES"
                                    description="Crea y edita la información de los grados escolares asociados al nivel académico." />

                                <EducationLevelGrid
                                    educationLevels={educationLevels}
                                    handleAddEducationLevel={handleAddEducationLevel}
                                    handleChangeEducationLevel={handleChangeEducationLevel}
                                    handleRemoveEducationLevel={handleRemoveEducationLevel}
                                    handleToggleEditEducationLevel={handleToggleEditEducationLevel}
                                />
                            </>
                        )
                    }
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/academic-levels">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar
                        {
                            isSubmitting && (<Spinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

            </form>
        </>
    )
}
