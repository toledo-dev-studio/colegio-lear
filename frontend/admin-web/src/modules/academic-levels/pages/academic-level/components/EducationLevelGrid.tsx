import { Pencil, Plus } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { EducationLevelResponse } from "@/interfaces/responses/education-level.response";

export interface AvailableEducationLevel extends EducationLevelResponse {
    isEditing: boolean;
}

interface Props {
    educationLevels: AvailableEducationLevel[];
    handleAddEducationLevel: () => void;
    handleRemoveEducationLevel: (id: string) => void;
    handleToggleEditEducationLevel: (id: string, isEditing: boolean) => void;
    handleChangeEducationLevel: (id: string, field: "name" | "description", value: string) => void;
}

export const EducationLevelGrid = ({ educationLevels = [], handleAddEducationLevel, handleRemoveEducationLevel, handleToggleEditEducationLevel, handleChangeEducationLevel }: Props) => {
    return (
        <>
            <div className="w-full rounded-2xl border border-border bg-muted/50 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 px-6">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Grados escolares disponibles</h3>
                        <p className="text-sm text-muted-foreground mt-2">Agrega los grados escolares que pertenecerán a este nivel académico.</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4 text-foreground"
                        onClick={handleAddEducationLevel}>
                        Agregar nuevo
                        <Plus className="ml-4 w-3 h-3 text-foreground" />
                    </Button>
                </div>

                <div className="grid gap-4">
                    {/* Ningún nivel académico registrado */}
                    {
                        (!educationLevels || !educationLevels.length) && (
                            <p className="text-sm text-center text-muted-foreground">No cuenta con ningún nivel educativo registrado.</p>
                        )
                    }

                    {/* Listado de niveles académicos */}
                    {
                        educationLevels?.map((level) =>
                        (
                            <div key={level.id} className="rounded-2xl border border-border bg-background p-4">
                                {!level.isEditing ? (
                                    <div className="flex items-center justify-between gap-4 px-6">
                                        <div>
                                            <p className="label">{level.name}</p>
                                            {level.description && (<p className="text-xs text-muted-foreground mt-2">{level.description}</p>)}
                                        </div>
                                        <Button
                                            type="button"
                                            className="btn-icon btn-icon-sm bg-muted/60 rounded-full h-4 !px-4 !py-0 text-primary"
                                            onClick={() => handleToggleEditEducationLevel(level.id, true)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <Input
                                                    value={isValidValueWithDefault(level.name, "")}
                                                    onChange={(event) => handleChangeEducationLevel(level.id, "name", event.target.value)}
                                                    placeholder="Nombre del grado"
                                                    className="pill-input w-full pl-8"
                                                />
                                            </div>
                                        </div>
                                        <Textarea
                                            value={isValidValueWithDefault(level.description, "")}
                                            onChange={(event) => handleChangeEducationLevel(level.id, "description", event.target.value)}
                                            placeholder="Descripción del grado educativo"
                                            className="pill-input w-full pl-8"
                                        />
                                        <div className="flex items-center justify-end">
                                            <Button
                                                type="button"
                                                variant={"ghost"}
                                                className="w-full sm:w-auto"
                                                onClick={() => handleRemoveEducationLevel(level.id)}>
                                                Eliminar grado
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                className="w-full sm:w-auto"
                                                onClick={() => handleToggleEditEducationLevel(level.id, false)}>
                                                Aceptar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}
