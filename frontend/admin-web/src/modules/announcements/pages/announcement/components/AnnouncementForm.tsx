import { useEffect } from "react";
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { InfoIcon, Save, X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { AttachmentsGrid } from "./AttachmentsGrid";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker";
import { CustomMultiSelect } from "@/shared/components/CustomMultiSelect";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { AUDIENCE, type Announcement } from "@/interfaces/entites/announcement";
import { CustomTipTapEditor } from "@/shared/components/custom-text-editor/CustomTipTapEditor";

interface Props {
    announcement?: Announcement,
    isSubmitting: boolean,
    onSubmit: (announcementLike: Partial<Announcement>) => void
}

export const AnnouncementForm = ({ announcement, isSubmitting, onSubmit }: Props) => {

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset
    } = useForm<Partial<Announcement>>({
        defaultValues: {
            ...announcement,
        }
    });

    useEffect(() => {
        if (announcement)
            reset(announcement);
    }, [announcement]);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* Main campaing information */}
                <section className="flex flex-col gap-y-6">
                    <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            INFORMACIÓN GENERAL DE LA CAMPAÑA
                        </h2>
                        <div className="w-fit flex items-center">
                            <Tooltip>
                                <TooltipTrigger>
                                    <Switch
                                        size="default"
                                        checked={watch("status") ?? false}
                                        onCheckedChange={(checked) => setValue("status", checked)} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Estatus del registro</p>
                                </TooltipContent>
                            </Tooltip>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Nombre de la campaña <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("name", { required: true })}
                                placeholder="Nombre del campaña..."
                                className="pill-input w-full pl-8" />
                            {
                                errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre de la campaña es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Audiencia a la que va dirigida de la campaña <span className="text-destructive">*</span>:
                            </label>
                            <Controller
                                name="audience"
                                control={control}
                                rules={{ validate: (v) => (v && v.length > 0) || "Selecciona al menos una audiencia" }}
                                render={({ field }) => (
                                    <CustomMultiSelect placeholder="Selecciona la audiencia..." availableOptions={AUDIENCE} value={field.value || []} onChange={field.onChange} />
                                )}
                            />
                            {errors.audience && <p className="text-red-500 text-sm mt-2">{errors.audience.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Fecha de publicación <span className="text-destructive">*</span>:</label>
                                <Controller
                                    name="publishedAt"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <CustomDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <p className="text-xs text-muted-foreground mt-1.5">A partir de que fecha la campaña estará disponible</p>
                                {
                                    errors.publishedAt && (
                                        <p className="text-red-500 text-sm mt-2">
                                            La fecha de publicación de la campaña es obligatoria
                                        </p>
                                    )
                                }
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Fecha de vencimiento <span className="text-destructive">*</span>:</label>
                                <Controller
                                    name="expiresAt"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <CustomDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <p className="text-xs text-muted-foreground mt-1.5">Hasta que fecha la campaña estará disponible</p>
                                {
                                    errors.expiresAt && (
                                        <p className="text-red-500 text-sm mt-2">
                                            La fecha de vencimiento de la campaña es obligatoria
                                        </p>
                                    )
                                }
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">Descripción del campaña:</label>
                            <Textarea
                                {...register("description")}
                                defaultValue={getValues("description")}
                                placeholder="Descripción del registro..."
                                className="pill-input w-full pl-8" />
                        </div>
                    </div>
                </section>

                {/* Content and Attachments for new announcements */}
                {
                    !announcement?.id && (
                        <>
                            <section className="flex flex-col gap-y-4">
                                <div className="flex flex-col items-start gap-y-4 border-b border-border pb-4 mt-8">
                                    <h2 className="w-full text-muted-foreground flex gap-x-4 items-center">
                                        <InfoIcon /> CONTENIDO DE LA CAMPAÑA & ARCHIVOS ADJUNTOS
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Una vez guardada la información general de la campaña, podrás agregar el contenido que se mostrará a los usuarios dentro del diseño de la campaña, así como también subir archivos complementarios para poder utilizarlos dentro del diseño de la campaña por medio de su enlace público.
                                        <br />
                                        Recuerda que pueden ser imágenes, documentos, hojas de cálculo y/o presentaciones no mayores a 10MB.
                                    </p>
                                </div>
                            </section>
                        </>
                    )
                }

                {/* Content and Attachments for existing announcements */}
                {
                    announcement?.id && (
                        <>
                            {/* Attachments */}
                            <section className="flex flex-col gap-y-4">
                                <div className="flex flex-col items-start gap-y-4 border-b border-border pb-4 mt-8">
                                    <h2 className="w-full text-muted-foreground">ARCHIVOS ADJUNTOS</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Sube archivos complementarios para poder utilizarlos dentro del diseño de la campaña por medio de su enlace públic.
                                        Recuerda que pueden ser imágenes, documentos, hojas de cálculo y/o presentaciones no mayores a 10MB.
                                    </p>
                                </div>
                                <div className="mt-2">
                                    <Controller
                                        name="attachments"
                                        control={control}
                                        render={({ field }) => (
                                            <AttachmentsGrid
                                                announcementId={announcement?.id!}
                                                attachments={field.value || []}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </section>

                            {/* TipTap text editor */}
                            <section className="flex flex-col gap-y-6">
                                <div className="flex flex-col items-start gap-y-4 border-b border-border pb-4 mt-8">
                                    <h2 className="w-full text-muted-foreground">
                                        CONTENIDO DE LA CAMPAÑA
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="w-full">
                                        <Controller
                                            name="content"
                                            control={control}
                                            rules={{
                                                validate: (v) => {
                                                    const text = (v || "").replace(/<[^>]+>/g, "").trim();
                                                    return text.length > 0 || "El contenido de la campaña no puede estar vacío";
                                                },
                                            }}
                                            render={({ field }) => <CustomTipTapEditor value={field.value ?? ""} onChange={field.onChange} />}
                                        />
                                        {
                                            errors.content && (
                                                <p className="text-red-500 text-sm mt-2">
                                                    {errors.content.message as string}
                                                </p>
                                            )
                                        }
                                    </div>
                                </div>
                            </section>
                        </>
                    )
                }


                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-6">
                    <Link to="/announcements">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"destructive"}>
                            Cancelar
                            <X className="ml-4 w-3 h-3" />
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar datos
                        {
                            isSubmitting ? (<CustomSpinner variant="primary" className="ml-4" />) : <Save className="ml-4 w-3 h-3" />
                        }
                    </Button>
                </section>

            </form>
        </>
    )
}
