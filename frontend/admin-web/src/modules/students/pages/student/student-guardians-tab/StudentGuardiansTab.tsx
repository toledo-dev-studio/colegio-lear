import { useState } from "react";
import { Navigate, useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Pencil, Phone, Plus, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { isValidEmail, isValidPhone } from "@/lib/extensions/validators";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { STUDENT_GUARDIANS, type StudentGuardian } from "@/interfaces/entites/student-guardian";
import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useGetStudentGuardiansForStudent } from "@/modules/students/hooks/student-guardians/useGetStudentGuardiansForStudent";
import { useDeleteStudentGuardianByIdForStudent } from "@/modules/students/hooks/student-guardians/useDeleteStudentGuardianByIdForStudent";
import { useCreateUpdateStudentGuardianForStudent } from "@/modules/students/hooks/student-guardians/useCreateUpdateStudentGuardianForStudent";

export const StudentGuardiansTab = () => {

    // Get context from layout
    const { studentId } = useOutletContext<StudentLayoutContext>();

    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
    const [studentGuardianToDelete, setStudentGuardianToDelete] = useState<StudentGuardian>();

    // Queries & mutations
    const studentGuardiansForStudentQuery = useGetStudentGuardiansForStudent(studentId!);
    const deleteStudentGuardianByIdForStudent = useDeleteStudentGuardianByIdForStudent();
    const createUpdateStudentGuardianForStudentMutation = useCreateUpdateStudentGuardianForStudent();

    // Use hook form configuration
    const { control, register, handleSubmit, formState: { errors }, watch, reset } = useForm<Partial<StudentGuardian>>({
        defaultValues: {
            id: "",
            studentId: studentId,
            fullName: "",
            email: "",
            phoneNumber: "",
            relationship: undefined,
            principal: false,
            authorizedToPickUp: false,
            emergencyContact: false,
            observations: ""
        }
    });

    const resetFormToDefaultValues = () => {
        reset({
            id: "",
            studentId: studentId,
            fullName: "",
            email: "",
            phoneNumber: "",
            relationship: undefined,
            principal: false,
            authorizedToPickUp: false,
            emergencyContact: false,
            observations: ""
        });
    }

    const handleClickDeleteStudentGuardian = (studentGuardian: StudentGuardian) => {
        setStudentGuardianToDelete(studentGuardian);
        setIsOpenSingleDeleteModal(true);
    }

    const handleClickCancelDeleteStudentGuardian = () => {
        setStudentGuardianToDelete(undefined);
        setIsOpenSingleDeleteModal(false);
    }

    const handleClickConfirmDeleteStudentGuardian = async () => {
        if (!studentGuardianToDelete)
            return;
        await deleteStudentGuardianByIdForStudent.mutateAsync({ studentId: studentGuardianToDelete.studentId, studentGuardianId: studentGuardianToDelete.id },
            {
                onSuccess: () => {
                    toast.success("Tutor eliminado correctamente", { position: "top-right" });
                    setStudentGuardianToDelete(undefined);
                    setIsOpenSingleDeleteModal(false);
                    resetFormToDefaultValues();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el tutor seleccionado", { position: "top-right" });
                }
            }
        );
    }

    const onSubmit = async (studentGuardianLike: Partial<StudentGuardian>) => {
        try {
            console.log(studentGuardianLike);
            showLoading("Guardando");
            await createUpdateStudentGuardianForStudentMutation.mutateAsync({ studentGuardianLike }, {
                onSuccess: () => {
                    toast.success("Tutor del estudiante guardado correctamente", { position: "top-right" });
                    hideLoading();
                    resetFormToDefaultValues();
                }
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error("Ocurrió un error al tratar de guardar el registro", { position: "top-right" });
        }
    }

    if (studentGuardiansForStudentQuery.isError) {
        toast.error("No fue posible obtener información de tutores del estudiante", { position: "top-right" });
        return <Navigate to="/students" />;
    }

    if (studentGuardiansForStudentQuery.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full my-4">
                    <CustomFullScreenLoading className="relative" title="Cargando tutores" subtitle="Por favor espere..." />
                </div>
            </>
        )
    }

    return (
        <>
            {/* Student guardian form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-8">
                <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                    <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            TUTORES DEL ESTUDIANTE
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            En esta sección de la pantalla podrás configurar la información de aquellas personas que se considerarán tutores de un estudiante.
                            <br />
                            Asegúrate de registrar solamente personas realmente autorizadas.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Nombre del estudiante <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("fullName", { required: true })}
                                placeholder="Nombre completo del tutor..." />
                            {
                                errors.fullName && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre completo del tutor es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Correo electrónico <span className="text-destructive">*</span>:
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    {...register("email",
                                        {
                                            required: true,
                                            validate: {
                                                isValidEmail: (value) => isValidEmail(value) || "El correo electrónico no es válido"
                                            }
                                        }
                                    )}
                                    placeholder="usuario@dominio.com"
                                    className="pr-13" />
                            </div>
                            {
                                errors.email && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.email.message || "El correo electrónico del empleado es obligatorio"}
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Número de teléfono<span className="text-destructive">*</span>:
                            </label>
                            <div className="relative">
                                <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    {...register("phoneNumber",
                                        {
                                            required: true,
                                            validate: {
                                                isValidPhone: (value) => isValidPhone(value) || "El número de teléfono no es válido"
                                            }
                                        }
                                    )}
                                    placeholder="+52 (55) 1234-5678"
                                    maxLength={10}
                                    className="pr-13" />
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
                                Parentesco<span className="text-destructive">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name={"relationship"}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {!field.value ? "Selecciona una opción" : STUDENT_GUARDIANS.find(item => item.key === field.value)?.label}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Parentesco</SelectLabel>
                                                {STUDENT_GUARDIANS.map((item) => (
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
                                errors.relationship && (
                                    <p className="text-red-500 text-sm mt-2">
                                        Es necesario confirmar el parentesco
                                    </p>
                                )
                            }
                        </div>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                ¿Es tutor principal?:
                            </label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="principal"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{field.value ? "Sí" : "No"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">El usuario que esta registrando es un tutor principal y podrá ver la actividad del estudiante.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                ¿Contacto de emergencia?:
                            </label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="emergencyContact"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{field.value ? "Sí" : "No"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">El usuario que esta registrando será considerado como contacto de emergencia.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                ¿Autorizado para recoger?:
                            </label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="authorizedToPickUp"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{field.value ? "Sí" : "No"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">El usuario que esta registrando podrá acudir al colegio para recoger al estudiante al finalizar clases.</p>
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
                    </div>
                    <div className="w-full flex justify-end items-center col-span-1 md:col-span-2 xl:col-span-3 mt-4">
                        <Button type="submit">
                            {watch("id") ? "Actualizar tutor" : "Registrar nuevo tutor"}
                            <Plus className="ml-4 w-4 h-4" />
                        </Button>
                    </div>
                </section>
            </form>

            {/* Guards table section */}
            <section className="flex flex-col gap-y-6">
                <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        LISTADO DE TUTORES REGISTRADOS
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        El siguiente listado contiene la información de los tutores registrados para este alumno.
                    </p>
                </div>

                {/* Guards table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            {/* Columns */}
                            <tr className="text-nowrap">
                                <th className="column">Nombre completo</th>
                                <th className="column">Parentesco</th>
                                <th className="column">No. de teléfono</th>
                                <th className="column">Correo electrónico</th>
                                <th className="column">¿Tutor principal?</th>
                                <th className="column">¿Contacto de emergencia?</th>
                                <th className="column">¿Autorizado para recoger?</th>
                                <th className="column">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Loading content */}
                            {
                                studentGuardiansForStudentQuery.isFetching && (
                                    <tr>
                                        <td colSpan={8} className="no-content-row">
                                            Cargando información, por favor espere...
                                        </td>
                                    </tr>
                                )
                            }
                            {/* No Content */}
                            {
                                (!studentGuardiansForStudentQuery.isFetching && !studentGuardiansForStudentQuery.data.length) && (
                                    <tr>
                                        <td colSpan={8} className="no-content-row py-8">
                                            No se cuenta con tutores registrados
                                        </td>
                                    </tr>
                                )
                            }
                            {/* Content */}
                            {
                                (!studentGuardiansForStudentQuery.isFetching && studentGuardiansForStudentQuery.data.length > 0) && (
                                    studentGuardiansForStudentQuery.data.map((studentGuardian) => (
                                        <tr key={studentGuardian.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="row">{studentGuardian.fullName}</td>
                                            <td className="row">{STUDENT_GUARDIANS.find(item => item.key === studentGuardian.relationship)?.label}</td>
                                            <td className="row">{studentGuardian.phoneNumber}</td>
                                            <td className="row">{studentGuardian.email}</td>
                                            <td className="row">
                                                <Badge variant={studentGuardian.principal ? "success" : "destructive"} className="py-4 px-6">
                                                    {
                                                        studentGuardian.principal ? "Sí" : "No"
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="row">
                                                <Badge variant={studentGuardian.emergencyContact ? "success" : "destructive"} className="py-4 px-6">
                                                    {
                                                        studentGuardian.emergencyContact ? "Sí" : "No"
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="row">
                                                <Badge variant={studentGuardian.authorizedToPickUp ? "success" : "destructive"} className="py-4 px-6">
                                                    {
                                                        studentGuardian.authorizedToPickUp ? "Sí" : "No"
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="row flex gap-x-4">
                                                <Button
                                                    type="button"
                                                    onClick={() => reset(studentGuardian)}
                                                    variant="default"
                                                    className="icon-btn">
                                                    <Pencil className="text-white w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleClickDeleteStudentGuardian(studentGuardian)}
                                                    variant="destructive"
                                                    className="icon-btn !bg-destructive/80">
                                                    <Trash className="text-white w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Delete single record modal */}
            {
                studentGuardianToDelete && (
                    <CustomDeleteModal
                        open={isOpenSingleDeleteModal}
                        title={`¿Estas seguro de eliminar al tutor "${studentGuardianToDelete?.fullName}"`}
                        message={"El registro se eliminará del sistema y no podrá ser recuperado"}
                        isLoading={deleteStudentGuardianByIdForStudent.isPending}
                        handleClickConfirm={handleClickConfirmDeleteStudentGuardian}
                        handleClickCancel={handleClickCancelDeleteStudentGuardian}
                    />
                )
            }
        </>
    )
}
