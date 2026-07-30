import { useState } from "react";
import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { AttachmentsGrid } from "./AttachmentsGrid";
import { Form } from "@/shared/components/form/Form";
import { Modal } from "@/shared/components/modal/Modal";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { AnnouncementStatsSection } from "./AnnouncementStatsSection";
import { TextEditor } from "@/shared/components/text-editor/TextEditor";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { MultiSelect } from "@/shared/components/multi-select/MultiSelect";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";
import type { AnnouncementRequest } from "@/interfaces/requests/announcement.request";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { getKeys, getKeyValuePairsByKeys, labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { ANNOUNCEMENTS_STATUSES, AUDIENCE_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    isNew: boolean;
    isSubmitting: boolean;
    announcementResponse?: AnnouncementResponse;
    onSubmit: (announcementRequestLike: Partial<AnnouncementRequest>) => Promise<void>;
}

export const AnnouncementForm = ({ isNew, isSubmitting, announcementResponse, onSubmit }: Props) => {
    // Constant configuration variables
    const isDraft = announcementResponse?.status === "draft" || isNew;
    const announcementAlreadyPublished = announcementResponse?.alreadyPublished;
    const ANNOUNCEMENTS_STATUSES_LIST = !announcementAlreadyPublished ? ANNOUNCEMENTS_STATUSES.filter(item => item.key === "draft" || item.key === "in-progress") : ANNOUNCEMENTS_STATUSES.filter(item => item.key !== "draft");

    // Component hooks & stores
    const navigate = useNavigate();
    const [confirmationRequired, setConfirmationRequired] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<AttachmentResponse[]>(announcementResponse?.attachments ?? []);
    const { control, handleSubmit, formState: { errors }, getValues } = useForm<Partial<AnnouncementRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(announcementResponse?.name, ""),
            status: isValidValueWithDefault(announcementResponse?.status, "draft"),
            description: isValidValueWithDefault(announcementResponse?.description, ""),
            audience: isValidValueWithDefault(announcementResponse?.audience, []),
            content: isValidValueWithDefault(announcementResponse?.content, ""),
            publishedAt: isValidValueWithDefault(announcementResponse?.publishedAt, ""),
            expiresAt: isValidValueWithDefault(announcementResponse?.expiresAt, "")
        }
    });

    const validateForm = async (announcementRequestLike: Partial<AnnouncementRequest>) => {
        // If campaing is "in-progress" and have not beed with the same "in-progress" status before, the systems requires a confirmation
        if (announcementRequestLike.status === "in-progress" && !announcementAlreadyPublished) {
            setConfirmationRequired(true);
            return;
        }
        await onSubmit(announcementRequestLike);
    }

    return (
        <>
            <Form moduleKey="announcements" isSubmitting={isSubmitting} onSubmit={handleSubmit(validateForm)} onCancel={() => navigate("/announcements")}>

                <section className="flex flex-col gap-y-6">

                    {/* Stats information */}
                    {
                        (!isNew && !isDraft) && (
                            <AnnouncementStatsSection recipientsCount={announcementResponse?.recipientsCount ?? 0} viewedCount={announcementResponse?.viewedCount ?? 0} />
                        )
                    }

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
                                disabled={!isDraft}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        disabled={!isDraft}
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
                                disabled={!isDraft}
                                rules={{ validate: (v) => (v && v.length > 0) || "Selecciona al menos una audiencia" }}
                                render={({ field }) => (
                                    <MultiSelect placeholder="Selecciona la audiencia..." disabled={!isDraft} availableOptions={AUDIENCE_TYPES} value={getKeyValuePairsByKeys(AUDIENCE_TYPES, field.value as any) || []} onChange={(value) => field.onChange(getKeys(value))} />
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
                                    disabled={!isDraft}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            disabled={!isDraft}
                                            placeholder="Fecha de publicación"
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
                                    disabled={!isDraft}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            disabled={!isDraft}
                                            placeholder="Fecha de vencimiento"
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
                                Estado de la campaña <span className="required">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name={"status"}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {labelOf(ANNOUNCEMENTS_STATUSES_LIST, field.value) || "Selecciona una opción"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Estado de la campaña</SelectLabel>
                                                {ANNOUNCEMENTS_STATUSES_LIST.map((item) => (
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
                                errors.status && (
                                    <p className="error">
                                        El estado de la campaña es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Descripción de la campaña:</label>
                            <Controller
                                name="description"
                                control={control}
                                disabled={!isDraft}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        disabled={!isDraft}
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

                    {/* Announcement content when is in progress */}
                    {
                        (!isNew && !isDraft) && (
                            <section className="flex flex-col gap-y-6">
                                <SectionTitle
                                    title="CONTENIDO DE LA CAMPAÑA"
                                    description="Consulta el contenido de la campaña" />
                                <section className="w-full px-6 sm:px-10 mx-auto">
                                    <article
                                        data-testid="announcement-viewer-content"
                                        className="tiptap-content prose prose-neutral dark:prose-invert max-w-none ProseMirror"
                                        /* Only the TipTap HTML content — no title, no metadata, per requirement */
                                        dangerouslySetInnerHTML={{ __html: announcementResponse?.content || "" }}
                                    />
                                </section>
                            </section>
                        )
                    }

                    {/* Content and Attachments for existing announcements */}
                    {
                        (!isNew && isDraft) && (
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
                                                render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
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

                </section>

                {/* Save confirmation modal */}
                <Modal
                    open={confirmationRequired}
                    type="info"
                    title="¡Antes de continuar!"
                    message={`
                        A partir de este momento se determinarán automáticamente los destinatarios de la campaña con base en los usuarios registrados actualmente en el sistema.
                        Los usuarios que se registren después de este cambio no serán incluidos en esta campaña. Si deseas incluirlos, será necesario crear una nueva campaña.
                        Esta acción no podrá deshacerse.
                        ¿Deseas continuar?`}
                    isLoading={false}
                    cancelButton={{
                        label: "Cancelar",
                        onClick: () => setConfirmationRequired(false)
                    }}
                    confirmButton={{
                        label: "Aceptar",
                        onClick: async () => {
                            setConfirmationRequired(false);
                            await onSubmit(getValues())
                        },
                    }}
                />

            </Form>
        </>
    )
}
