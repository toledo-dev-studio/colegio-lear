import { useState } from "react";
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { AttachmentsGrid } from "./AttachmentsGrid";
import { AUDIENCE } from "@/interfaces/entites/announcement";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { MultiSelect } from "@/shared/components/multi-select/MultiSelect";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";
import type { AnnouncementRequest } from "@/interfaces/requests/announcement.request";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { CustomTipTapEditor } from "@/shared/components/custom-text-editor/CustomTipTapEditor";

interface Props {
    isNew: boolean;
    isSubmitting: boolean;
    announcementResponse?: AnnouncementResponse;
    onSubmit: (announcementRequestLike: Partial<AnnouncementRequest>) => void;
}

export const AnnouncementForm = ({ isNew, isSubmitting, announcementResponse, onSubmit }: Props) => {

    const [attachments, setAttachments] = useState<AttachmentResponse[]>(announcementResponse?.attachments ?? []);
    const { control, handleSubmit, formState: { errors } } = useForm<Partial<AnnouncementRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(announcementResponse?.name, ""),
            isActive: isValidValueWithDefault(announcementResponse?.isActive, false),
            description: isValidValueWithDefault(announcementResponse?.description, ""),
            audience: isValidValueWithDefault(announcementResponse?.audience, []),
            content: isValidValueWithDefault(announcementResponse?.content, ""),
            publishedAt: isValidValueWithDefault(announcementResponse?.publishedAt, ""),
            expiresAt: isValidValueWithDefault(announcementResponse?.expiresAt, "")
        }
    });

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <SectionTitle
                    title="INFORMACIÓN GENERAL DE LA CAMPAÑA"
                    description="Registro de información básica de la campaña." />

                <div className="grid grid-cols-1 gap-8">

                    <div className="control-container">
                        <label className="label">
                            Nombre de la campaña <span className="required">*</span>
                        </label>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre de la campaña..."
                                />
                            )} />
                        {
                            errors.name && (
                                <p className="error">
                                    El nombre de la campaña es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">
                            Audiencia a la que va dirigida de la campaña <span className="required">*</span>:
                        </label>
                        <Controller
                            name="audience"
                            control={control}
                            rules={{ validate: (v) => (v && v.length > 0) || "Selecciona al menos una audiencia" }}
                            render={({ field }) => (
                                <MultiSelect placeholder="Selecciona la audiencia..." availableOptions={AUDIENCE} value={field.value || []} onChange={field.onChange} />
                            )}
                        />
                        {
                            errors.audience && (
                                <p className="error">
                                    {errors.audience.message as string}
                                </p>
                            )
                        }
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="control-container">
                            <label className="label">
                                Fecha de publicación <span className="required">*</span>:
                            </label>
                            <Controller
                                name="publishedAt"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <p className="control-info">A partir de que fecha la campaña estará disponible</p>
                            {
                                errors.publishedAt && (
                                    <p className="error">
                                        La fecha de publicación de la campaña es obligatoria
                                    </p>
                                )
                            }
                        </div>
                        <div className="control-container">
                            <label className="label">
                                Fecha de vencimiento <span className="required">*</span>:
                            </label>
                            <Controller
                                name="expiresAt"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <p className="control-info">Hasta que fecha la campaña estará disponible</p>
                            {
                                errors.expiresAt && (
                                    <p className="error">
                                        La fecha de vencimiento de la campaña es obligatoria
                                    </p>
                                )
                            }
                        </div>
                    </div>
                    <div className="control-container">
                        <label className="label">
                            Descripción de la campaña:
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Content and Attachments for new announcements */}
                {
                    isNew && (
                        <>
                            <CardAlert
                                type="info"
                                title="CONTENIDO DE LA CAMPAÑA & ARCHIVOS ADJUNTOS"
                                message="Una vez guardada la información general de la campaña, podrás agregar el contenido que se mostrará a los usuarios dentro del diseño de la campaña, así como también subir archivos complementarios para poder utilizarlos dentro del diseño de la campaña por medio de su enlace público. Recuerda que pueden ser imágenes, documentos, hojas de cálculo y/o presentaciones no mayores a 10MB." />
                        </>
                    )
                }

                {/* Content and Attachments for existing announcements */}
                {
                    !isNew && (
                        <>
                            {/* Attachments */}
                            <section className="flex flex-col gap-y-4">
                                <SectionTitle
                                    title="ARCHIVOS ADJUNTOS"
                                    description="Sube archivos complementarios para poder utilizarlos dentro del diseño de la campaña por medio de su enlace públic. Recuerda que pueden ser imágenes, documentos, hojas de cálculo y/o presentaciones no mayores a 10MB." />
                                <div className="mt-2">
                                    <AttachmentsGrid
                                        announcementId={announcementResponse?.id!}
                                        attachments={attachments}
                                        onChange={(attachments) => setAttachments(attachments)}
                                    />
                                </div>
                            </section>

                            {/* TipTap text editor */}
                            <section className="flex flex-col gap-y-6">
                                <SectionTitle
                                    title="CONTENIDO DE LA CAMPAÑA"
                                    description="Edita el contenido de la plantilla para la campaña actual" />

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="control-container">
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
                                                <p className="error">
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
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/announcements">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar
                        {
                            isSubmitting && (<CustomSpinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

            </form>
        </>
    )
}
