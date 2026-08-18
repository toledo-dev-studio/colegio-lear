import { useRef } from "react";
import { Camera, User as UserIcon, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn/ui/tooltip";

interface Props {
    value?: string;
    changedImage?: boolean;
    onChange: (file?: File) => void;
}

export const PhotoUploader = ({ value, changedImage, onChange }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <div className="flex flex-col items-center gap-3" data-testid="photo-uploader">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-muted ring-4 ring-primary/15 flex items-center justify-center overflow-hidden">
                        {value ? (
                            <img src={value} alt="Fotografía del alumno" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-muted-foreground/60" />
                        )}
                    </div>
                    <Tooltip>
                        <TooltipTrigger className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors cursor-pointer">
                            <div
                                onClick={() => inputRef.current?.click()}
                                data-testid="photo-upload-button"
                                aria-label="Subir fotografía"
                            >
                                <Camera className="w-4 h-4" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Seleccionar imagen</p>
                        </TooltipContent>
                    </Tooltip>

                    {changedImage && (
                        <Tooltip>
                            <TooltipTrigger className="absolute top-1 right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow hover:bg-destructive/90 transition-colors cursor-pointer">
                                <div
                                    onClick={() => onChange(undefined)}
                                    data-testid="photo-remove-button"
                                    aria-label="Quitar fotografía">
                                    <X className="w-3.5 h-3.5" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Remover imagen</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">JPG, JPEG, PNG, máx. 5MB</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0])}
                />
            </div>
        </>
    );
}
