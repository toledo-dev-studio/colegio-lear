import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/shared/shadcn/ui/button";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { PhotoUploader } from "@/shared/components/photo-uploader/PhotoUploader";
import { extractFileExtension } from "@/lib/extensions/attachments";
import { DEFAULT_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/attachment.constants";

interface Props {
    avatar?: string;
    isSubmitting: boolean;
    onSubmit: (file: File) => Promise<void>;
}

// Sección para actualizar la fotografía de perfil del alumno

export const AvatarSection = ({ avatar, isSubmitting, onSubmit }: Props) => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<{ file?: File }>({
        mode: "onChange"
    });

    const selectedFile = useWatch({ control, name: "file" });

    const handleOnSubmit = async ({ file }: { file?: File }) => {
        if (!file) return;
        await onSubmit(file);
        reset();
    };

    return (
        <>
            <section className="flex flex-col items-center justify-center gap-6">
                <Controller
                    name="file"
                    control={control}
                    rules={{
                        validate: {
                            maxSize: (file) => !file ? true : file!.size <= MAX_IMAGE_SIZE_BYTES || "El tamaño de la imagen debe ser menor o igual a 5MB",
                            validFormat: (file) => !file ? true : DEFAULT_IMAGE_EXTENSIONS.includes(`.${extractFileExtension(file!.name)}`) || "El formato seleccionado no es un válido"
                        }
                    }}
                    render={({ field, fieldState }) => (
                        <>
                            <PhotoUploader
                                value={field.value ? URL.createObjectURL(field.value) : avatar}
                                changedImage={!!field.value && fieldState.isTouched}
                                onChange={(file) => {
                                    field.onChange(file);
                                    field.onBlur();
                                }} />
                            {
                                errors.file && (
                                    <p className="text-red-500 text-center text-sm mt-2">
                                        {errors.file.message}
                                    </p>
                                )
                            }
                        </>
                    )}
                />

                <form onSubmit={handleSubmit(handleOnSubmit)}>
                    <Button type="submit" disabled={isSubmitting || !selectedFile} aria-label="save-avatar">
                        Guardar fotografía
                        {
                            isSubmitting && (<Spinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </form>
            </section>
        </>
    )
}