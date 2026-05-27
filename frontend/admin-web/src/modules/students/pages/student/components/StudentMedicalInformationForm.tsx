import { toast } from "sonner";
import { Link, Navigate, useNavigate } from "react-router";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useGetByIdStudentMedicalInformation } from "@/modules/students/hooks/medical-information/useGetByIdStudentMedicalInformation";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { BLOOD_TYPES, type StudentMedicalInformation } from "@/interfaces/entites/student-medical-information";
import { ALLERGY_SEVERITIES } from "@/interfaces/entites/allergy";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Plus, Save, Trash, X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { useUpdateStudentMedicalInformation } from "@/modules/students/hooks/medical-information/useUpdateStudentMedicalInformation";

interface Props {
    id: string;
}

export const StudentMedicalInformationForm = ({ id }: Props) => {

    const { showLoading, hideLoading } = useLoaderStore();
    const studentMedicalInformationQuery = useGetByIdStudentMedicalInformation(id);
    const mutation = useUpdateStudentMedicalInformation();

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<Partial<StudentMedicalInformation>>({
        defaultValues: {
            ...studentMedicalInformationQuery.data,
            allergies: studentMedicalInformationQuery.data?.allergies ?? []
        }
    });

    // Allergies management
    const inputNewAllergyRef = useRef<HTMLInputElement>(null);
    const { fields: allergyFields, append, remove } = useFieldArray({ control, name: "allergies" });

    const onSubmit = async (studentMedicalInformationLike: Partial<StudentMedicalInformation>) => {
        try {
            showLoading("Guardando registro");
            await mutation.mutateAsync({ studentId: id, studentMedicalInformationLike }, {
                onSuccess: () => {
                    toast.success("Datos médicos del estudiante actualizados correctamente", { position: "top-right" });
                    hideLoading();
                }
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error("Ocurrió un error al tratar de actualizar los datos médicos del estudiante", { position: "top-right" });
        }
    }

    const handleAddAllergy = () => {
        const name = inputNewAllergyRef.current?.value.trim();
        if (!name)
            return;
        append({
            name: name,
            severity: "mild",
            observations: ""
        });
        inputNewAllergyRef.current!.value = "";
    };

    useEffect(() => {
        if (studentMedicalInformationQuery.data)
            reset(studentMedicalInformationQuery.data);
    }, [studentMedicalInformationQuery.data]);

    if (studentMedicalInformationQuery.isError) {
        toast.error("No fue posible obtener información del estudiante", { position: "top-right" });
        return <Navigate to="/students" />;
    }

    if (studentMedicalInformationQuery.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full my-4">
                    <CustomFullScreenLoading className="relative" title="Cargando información médica" subtitle="Por favor espere..." />
                </div>
            </>
        )
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* Main student information */}
                <section className="flex flex-col gap-y-6 mt-2">
                    <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            INFORMACIÓN MÉDICA DEL ESTUDIANTE
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            En esta sección de la pantalla podrás configurar la información médica de un estudiante, asegúrate de que toda la información sea la correcta, será de ayuda para casos de emergencia.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Tipo de sangre <span className="text-destructive">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name="bloodType"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona el tipo de sangre">
                                                {!field.value ? "Selecciona una opción" : BLOOD_TYPES.find(bt => bt.key === field.value)?.label}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Tipo de sangre</SelectLabel>
                                                {
                                                    BLOOD_TYPES.map(bloodType => (
                                                        <SelectItem key={bloodType.key} value={bloodType.key} label={bloodType.label}>
                                                            {bloodType.label}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )} />
                            {
                                errors.bloodType && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El tipo de sangre del estudiante es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full col-span-1 md:col-span-2 xl:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-3 block">Información complementaria:</label>
                            <Textarea
                                {...register("emergencyNotes")}
                                placeholder="Información complementaria..."
                                className="pill-input w-full pl-8" />
                        </div>
                    </div>
                </section>

                {/* Allergies */}
                <section className="flex flex-col gap-y-6 mt-8">
                    <div className="flex flex-col gap-y-4 justify-center border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            ALERGIAS DEL ESTUDIANTE
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Escribe la alergia y da click en el botón de agregar o presiona Enter para registrar las alergias del estudiante. Si el estudiante no tiene alergias conocidas, puedes dejar este campo vacío.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 border-b border-border pb-6">
                        <div className="w-full">
                            <div className="flex gap-y-4 flex-row justify-between gap-x-4">
                                <Input
                                    type="text"
                                    ref={inputNewAllergyRef}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddAllergy();
                                        }
                                    }}
                                    placeholder="Nombre de la alergia..." />
                                <Button
                                    type="button"
                                    onClick={handleAddAllergy}
                                    variant="default"
                                    className="icon-btn icon-btn-ribbon bg-primary"
                                    aria-label="Agregar alergia">
                                    <Plus className="text-white w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-4">
                        {
                            allergyFields.map((field, index) => (
                                <div key={field.id} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="grid grid-cols-1 xxl:grid-cols-2 gap-4 flex-1">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-foreground">Nombre de la alergia:</label>
                                                <Input
                                                    {...register(`allergies.${index}.name` as const, { required: true })}
                                                    placeholder="Ej. Alergia a cacahuates"
                                                    className="w-full" />
                                                {
                                                    errors.allergies?.[index]?.name && (<p className="text-red-500 text-sm mt-2">El nombre de la alergia es obligatorio</p>)
                                                }
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-foreground">Severidad</label>
                                                <Controller
                                                    control={control}
                                                    name={`allergies.${index}.severity` as const}
                                                    defaultValue={field.severity ?? "mild"}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value ?? ""}
                                                            onValueChange={field.onChange}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Selecciona severidad">
                                                                    {!field.value ? "Selecciona una opción" : ALLERGY_SEVERITIES.find(severity => severity.key === field.value)?.label}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>Severidad</SelectLabel>
                                                                    {ALLERGY_SEVERITIES.map((severity) => (
                                                                        <SelectItem key={severity.key} value={severity.key} label={severity.label}>
                                                                            {severity.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={() => remove(index)}
                                            variant="destructive"
                                            className="icon-btn !bg-destructive/80 absolute -top-4 -right-4"
                                            aria-label={`Eliminar alergia ${field.name}`}>
                                            <Trash className="text-white w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-foreground mb-2 block">Observaciones</label>
                                        <Textarea
                                            {...register(`allergies.${index}.observations` as const)}
                                            placeholder="Notas adicionales..."
                                            className="w-full" />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-10 gap-x-6">
                    <Link to="/students">
                        <Button type="button" disabled={mutation.isPending} aria-label="cancel" variant={"destructive"}>
                            Cancelar
                            <X className="ml-4 w-3 h-3" />
                        </Button>
                    </Link>
                    <Button type="submit" disabled={mutation.isPending} aria-label="save-record">
                        Guardar datos
                        {
                            mutation.isPending ? (<CustomSpinner variant="primary" className="ml-4" />) : <Save className="ml-4 w-3 h-3" />
                        }
                    </Button>
                </section>
            </form>
        </>
    )
}
