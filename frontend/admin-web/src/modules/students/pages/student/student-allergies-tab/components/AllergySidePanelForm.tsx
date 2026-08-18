import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/shadcn/ui/input";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { AllergyRequest } from "@/interfaces/requests/allergy.request";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";
import { ALLERGY_SEVERITIES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";

interface Props {
    allergyResponse: Partial<AllergyResponse>;
    handleClickClose: () => void;
    onSubmit: (allergyRequestLike: Partial<AllergyRequest>) => void;
}

export const AllergySidePanelForm = ({ allergyResponse, handleClickClose, onSubmit }: Props) => {
    // Use react hook form configuration
    const { control, formState: { errors }, handleSubmit } = useForm<Partial<AllergyRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(allergyResponse?.name, ""),
            severity: isValidValueWithDefault(allergyResponse?.severity, undefined),
            observations: isValidValueWithDefault(allergyResponse?.observations, ""),
        }
    });

    return (
        <>
            <SidePanel
                title="REGISTRO DE ALERGÍA"
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickClose }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>
                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Alérgico a <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Alérgico a"
                                />
                            )}
                        />
                        {
                            errors.name && (
                                <p className="error">
                                    El nombre de la alergía es requerido
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Severidad <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name="severity"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una opción">
                                            {!field.value ? "Selecciona una opción" : labelOf(ALLERGY_SEVERITIES, field.value ?? "")}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Severidad</SelectLabel>
                                            {ALLERGY_SEVERITIES.map((item) => (
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
                            errors.severity && (
                                <p className="error">
                                    La severidad de la alergía es requerida
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Observaciones:</label>
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
                </form>

            </SidePanel>
        </>
    )
}
