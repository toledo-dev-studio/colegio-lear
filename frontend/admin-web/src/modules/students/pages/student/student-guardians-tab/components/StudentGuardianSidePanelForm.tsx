import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { AllergyRequest } from "@/interfaces/requests/allergy.request";
import type { StudentGuardianRequest } from "@/interfaces/requests/student-guardian.request";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";
import { STUDENT_GUARDIANS_RELATIONSHIPS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { isValidEmail, isValidPhone } from "@/lib/extensions/validators";
import { Mail, Phone } from "lucide-react";

interface Props {
    studentGuardianResponse: Partial<StudentGuardianResponse>;
    handleClickClose: () => void;
    onSubmit: (allergyRequestLike: Partial<AllergyRequest>) => void;
}

export const StudentGuardianSidePanelForm = ({ studentGuardianResponse, handleClickClose, onSubmit }: Props) => {
    // Use react hook form configuration
    const { control, formState: { errors }, watch, handleSubmit } = useForm<Partial<StudentGuardianRequest>>({
        defaultValues: {
            fullName: isValidValueWithDefault(studentGuardianResponse?.fullName, ""),
            relationship: isValidValueWithDefault(studentGuardianResponse?.relationship, undefined),
            phoneNumber: isValidValueWithDefault(studentGuardianResponse?.phoneNumber, ""),
            email: isValidValueWithDefault(studentGuardianResponse?.email, ""),
            isPrincipal: isValidValueWithDefault(studentGuardianResponse?.isPrincipal, false),
            authorizedToPickUp: isValidValueWithDefault(studentGuardianResponse?.authorizedToPickUp, false),
            emergencyContact: isValidValueWithDefault(studentGuardianResponse?.emergencyContact, false),
            observations: isValidValueWithDefault(studentGuardianResponse?.observations, ""),
        }
    });
    const isPrincipal = watch("isPrincipal");

    return (
        <>
            <SidePanel
                title="REGISTRO DE TUTOR"
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickClose }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>
                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Nombre completo <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name="fullName"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre completo..."
                                />
                            )}
                        />
                        {
                            errors.fullName && (
                                <p className="error">
                                    El nombre del tutor es requerido
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Parentesco <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name="relationship"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una opción">
                                            {!field.value ? "Selecciona una opción" : labelOf(STUDENT_GUARDIANS_RELATIONSHIPS, field.value ?? "")}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Parentesco</SelectLabel>
                                            {STUDENT_GUARDIANS_RELATIONSHIPS.map((item) => (
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
                                <p className="error">
                                    El parentesco del tutor es requerido
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Número de teléfono {isPrincipal && <span className="required">*</span>}:</label>
                        <Controller
                            name="phoneNumber"
                            control={control}
                            rules={{
                                required: isPrincipal, validate: (value) => {
                                    if (!isPrincipal && !value)
                                        return true;
                                    return isValidPhone(value) || "El número de teléfono debe tener al menos 10 dígitos"
                                }
                            }}
                            render={({ field }) => (
                                <div className="icon-control-container">
                                    <Phone className="icon" />
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="+52 55-1234-5678" />
                                </div>
                            )}
                        />
                        {
                            (isPrincipal && errors.phoneNumber) && (
                                <p className="error">
                                    {errors.phoneNumber.message || "El número de teléfono es obligatorio"}
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Correo electrónico {isPrincipal && <span className="required">*</span>}:</label>
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: isPrincipal, validate: (value) => {
                                    if (!isPrincipal && !value)
                                        return true;
                                    return isValidEmail(value) || "El correo electrónico no es válido"
                                }
                            }}
                            render={({ field }) => (
                                <div className="icon-control-container">
                                    <Mail className="icon" />
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="usuario@dominio.com" />
                                </div>
                            )}
                        />
                        {
                            (isPrincipal && errors.email) && (
                                <p className="error">
                                    {errors.email.message || "El correo electrónico es obligatorio"}
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">¿Es tutor principal?:</label>
                        <Controller
                            name="isPrincipal"
                            control={control}
                            render={({ field }) => (
                                <label className="switch-control-container">
                                    <div>
                                        <p className="label">{field.value ? "Sí" : "No"}</p>
                                        <p className="description">El usuario que esta registrando es un tutor principal y podrá ver la actividad del estudiante.</p>
                                    </div>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </label>
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">¿Contacto de emergencia?:</label>
                        <Controller
                            name="emergencyContact"
                            control={control}
                            render={({ field }) => (
                                <label className="switch-control-container">
                                    <div>
                                        <p className="label">{field.value ? "Sí" : "No"}</p>
                                        <p className="description">El usuario que esta registrando será considerado como contacto de emergencia.</p>
                                    </div>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </label>
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">¿Autorizado para recoger?:</label>
                        <Controller
                            name="authorizedToPickUp"
                            control={control}
                            render={({ field }) => (
                                <label className="switch-control-container">
                                    <div>
                                        <p className="label">{field.value ? "Sí" : "No"}</p>
                                        <p className="description">El usuario que esta registrando podrá acudir al colegio para recoger al estudiante al finalizar clases.</p>
                                    </div>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </label>
                            )}
                        />
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
