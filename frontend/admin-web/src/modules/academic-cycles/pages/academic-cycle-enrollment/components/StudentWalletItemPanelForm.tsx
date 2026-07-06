import { Controller, useForm } from "react-hook-form";

import { Switch } from "@/shared/ui/switch";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import type { StudentWalletItemRequest } from "@/interfaces/requests/student-wallet-item.request";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";

interface Props {
    studentWalletItemResponse?: Partial<StudentWalletItemResponse>;
    handleClickClose: () => void;
    onSubmit: (studentWalletItemRequestLike: Partial<StudentWalletItemRequest>) => void;
}

export const StudentWalletItemPanelForm = ({ studentWalletItemResponse, handleClickClose, onSubmit }: Props) => {
    // Use hook form configuration
    const { control, handleSubmit, watch } = useForm<Partial<StudentWalletItemRequest>>({
        defaultValues: {
            extensionDate: isValidValueWithDefault(studentWalletItemResponse?.extensionDate, ""),
            allowForgiveness: isValidValueWithDefault(studentWalletItemResponse?.allowForgiveness, false),
            isForgiven: isValidValueWithDefault(studentWalletItemResponse?.isForgiven, false),
        }
    });
    const allowedForgiveness = watch("allowForgiveness");

    return (
        <>
            <SidePanel
                title="EDICIÓN DE CONCEPTO DE PAGO"
                closeButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickClose }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>
                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Fecha de prorroga de pago:</label>
                        <Controller
                            name="extensionDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">¿Permitir condonación?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="allowForgiveness"
                                control={control}
                                render={({ field }) => (
                                    <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{field.value ? "Permitido" : "No permitido"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">El concepto de pago permite la condonación del pago.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>

                    {
                        allowedForgiveness && (
                            <div className="control-container">
                                <label className="label">¿Condonar pago?:</label>
                                <div className="flex items-center justify-center">
                                    <Controller
                                        name="isForgiven"
                                        control={control}
                                        render={({ field }) => (
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Condonado" : "No condonado"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">El pago pendiente quedará saldado cuando se active esta opción.</p>
                                                </div>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>
                        )
                    }

                </form>
            </SidePanel>
        </>
    )
}
