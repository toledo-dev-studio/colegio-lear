import { useState } from "react";
import { Pencil, Plus, Trash } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { generateTemporalId } from "@/lib/extensions/utils";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { ALLERGY_SEVERITIES, type Allergy } from "@/interfaces/entites/allergy";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    allergies: Allergy[],
    onUpdateAllergies: (allergies: Allergy[]) => void;
}

export const StudentAllergiesSection = ({ allergies = [], onUpdateAllergies }: Props) => {

    // Hooks & stores
    const [currentAllergies, setCurrentAllergies] = useState<Allergy[]>(allergies);
    const [allergyToDelete, setAllergyToDelete] = useState<Allergy>();
    const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);

    // Use hook form configuration
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<Partial<Allergy>>();

    const handleClickConfirmDeleteAllergy = () => {
        if (!allergyToDelete)
            return;
        const updatedAllergies = currentAllergies.filter(allergy => allergy.id !== allergyToDelete.id);
        onUpdateAllergies(updatedAllergies);
        setCurrentAllergies(updatedAllergies);
        setAllergyToDelete(undefined);
        setIsOpenSingleDeleteModal(false);
    }

    const handleClickCancelDeleteAllergy = () => {
        setAllergyToDelete(undefined);
        setIsOpenSingleDeleteModal(false);
    }

    const handleClickDeleteAllergy = (allergy: Allergy) => {
        setAllergyToDelete(allergy);
        setIsOpenSingleDeleteModal(true);
    }

    const onSubmit = (allergyLike: Partial<Allergy>) => {
        let updatedAllergies = [];
        if (!allergyLike.id) {
            updatedAllergies = [...currentAllergies, { ...allergyLike, id: generateTemporalId() }]
        } else {
            updatedAllergies = [...currentAllergies.filter(allergy => allergy.id !== allergyLike.id), { ...allergyLike }]
        }
        onUpdateAllergies(updatedAllergies as Allergy[]);
        setCurrentAllergies(updatedAllergies as Allergy[]);
        reset({
            id: "",
            name: "",
            severity: undefined,
            observations: "",
        });
    }

    return (
        <>
            <div className="flex flex-col gap-y-4 justify-center border-b border-border pb-4">
                <h2 className="w-full text-muted-foreground">
                    ALERGIAS DEL ESTUDIANTE
                </h2>
                <p className="text-xs text-muted-foreground">
                    Escribe la información necesaria para registrar y/o actualizar una alergia que padezca el estudiante. No olvides dar clic en editar para modificar una alergia y registrada previamente.
                    <br />
                    Si el estudiante no tiene alergias conocidas, puedes dejar este campo vacío.
                </p>
            </div>

            {/* Create & update allergy form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-8">
                <div className="w-full">
                    <label className="text-sm font-medium text-foreground mb-3 block">
                        Nombre<span className="text-destructive">*</span>:
                    </label>
                    <Input
                        type="text"
                        {...register("name", { required: true })}
                        defaultValue={watch("name")}
                        placeholder="Nueces, penicilina, etc..." />
                    {
                        errors.name && (
                            <p className="text-red-500 text-sm mt-2">
                                El nombre de la alergia es obligatorio
                            </p>
                        )
                    }
                </div>
                <div className="w-full">
                    <label className="text-sm font-medium text-foreground mb-3 block">
                        Severidad<span className="text-destructive">*</span>:
                    </label>
                    <Controller
                        control={control}
                        name={"severity"}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select
                                value={field.value ?? ""}
                                onValueChange={field.onChange}>
                                <SelectTrigger>
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
                    {
                        errors.severity && (
                            <p className="text-red-500 text-sm mt-2">
                                La severidad de la alergia es obligatorio
                            </p>
                        )
                    }
                </div>
                <div className="w-full col-span-1 md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-3 block">Observaciones sobre la alergia:</label>
                    <Textarea
                        {...register("observations")}
                        defaultValue={watch("observations")}
                        placeholder="Observaciones sobre la alergia..." />
                </div>
                <div className="w-full flex justify-start items-center col-span-1 md:col-span-2 mt-4">
                    <Button type="button" variant={"outline"} className="text-primary hover:text-white hover:bg-primary !border-primary hover:border-white bg-white" onClick={handleSubmit(onSubmit)}>
                        {watch("id") ? "Actualizar alergia" : "Agregar alergia"}
                        <Plus className="ml-4 w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Allergies table section */}
            <section className="flex flex-col gap-y-6">
                <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        LISTADO DE ALERGIAS
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        El siguiente listado contiene la información de las alergias registradas para este alumno.
                    </p>
                </div>

                {/* Allergies table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            {/* Columns */}
                            <tr className="text-nowrap">
                                <th className="column">Nombre de la alergía</th>
                                <th className="column">Severidad</th>
                                <th className="column">Observaciones</th>
                                <th className="column">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* No content */}
                            {
                                !currentAllergies.length && (
                                    <tr>
                                        <td colSpan={4} className="no-content-row py-8">
                                            No se cuenta con tutores registrados
                                        </td>
                                    </tr>
                                )
                            }
                            {/* Content */}
                            {
                                currentAllergies.map((allergy) => (
                                    <tr key={allergy.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="row">{allergy.name}</td>
                                        <td className="row">{ALLERGY_SEVERITIES.find(severity => severity.key === allergy.severity)?.label}</td>
                                        <td className="row">{allergy.observations || "-"}</td>
                                        <td className="row flex gap-x-4">
                                            <Button
                                                type="button"
                                                onClick={() => reset(allergy)}
                                                variant="default"
                                                className="icon-btn">
                                                <Pencil className="text-white w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => handleClickDeleteAllergy(allergy)}
                                                variant="destructive"
                                                className="icon-btn !bg-destructive/80">
                                                <Trash className="text-white w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Delete single record modal */}
            {
                allergyToDelete && (
                    <CustomDeleteModal
                        open={isOpenSingleDeleteModal}
                        title={`¿Estas seguro de eliminar la alergia "${allergyToDelete?.name}"`}
                        message={"El registro se eliminará del sistema y no podrá ser recuperado"}
                        isLoading={false}
                        handleClickConfirm={handleClickConfirmDeleteAllergy}
                        handleClickCancel={handleClickCancelDeleteAllergy}
                    />
                )
            }
        </>
    )
}
