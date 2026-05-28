import { useEffect } from "react";
import { Link, Navigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { StudentAllergiesSection } from "./StudentAllergiesSection";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { BLOOD_TYPES, type StudentMedicalInformation } from "@/interfaces/entites/student-medical-information";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useGetStudentMedicalInformationForStudent } from "@/modules/students/hooks/medical-information/useGetStudentMedicalInformationForStudent";
import { useUpdateStudentMedicalInformationForStudent } from "@/modules/students/hooks/medical-information/useUpdateStudentMedicalInformationForStudent";

interface Props {
    id: string;
}

export const StudentMedicalInformationForm = ({ id }: Props) => {

    const { showLoading, hideLoading } = useLoaderStore();
    const studentMedicalInformationQuery = useGetStudentMedicalInformationForStudent(id);
    const updateStudentMedicalInformationForStudentMutation = useUpdateStudentMedicalInformationForStudent();

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset
    } = useForm<Partial<StudentMedicalInformation>>({
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            ...studentMedicalInformationQuery.data,
            allergies: studentMedicalInformationQuery.data.allergies,
        }
    });

    const onSubmit = async (studentMedicalInformationLike: Partial<StudentMedicalInformation>) => {
        try {
            showLoading("Guardando");
            await updateStudentMedicalInformationForStudentMutation.mutateAsync({ studentId: id, studentMedicalInformationLike }, {
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
                    {/* Allergies section */}
                    <StudentAllergiesSection allergies={studentMedicalInformationQuery.data.allergies} onUpdateAllergies={(allergies) => setValue("allergies", allergies)} />
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-10 gap-x-6">
                    <Link to="/students">
                        <Button type="button" disabled={updateStudentMedicalInformationForStudentMutation.isPending} aria-label="cancel" variant={"destructive"}>
                            Cancelar
                            <X className="ml-4 w-3 h-3" />
                        </Button>
                    </Link>
                    <Button type="submit" disabled={updateStudentMedicalInformationForStudentMutation.isPending} aria-label="save-record">
                        Guardar datos
                        {
                            updateStudentMedicalInformationForStudentMutation.isPending ? (<CustomSpinner variant="primary" className="ml-4" />) : <Save className="ml-4 w-3 h-3" />
                        }
                    </Button>
                </section>
            </form>
        </>
    )
}
