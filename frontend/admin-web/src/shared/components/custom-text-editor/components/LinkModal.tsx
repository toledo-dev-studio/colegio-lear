import { useRef, useState } from 'react';

import { Input } from '@/shared/ui/input';
import { cn } from '@/lib/extensions/utils';
import { isValidUrl } from '@/lib/extensions/validators';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui/alert-dialog'

interface Props {
    open: boolean;
    title: string;
    description: string;
    inputLabel: string;
    inputPlaceholder: string;
    inputDefaultValue: string;
    isLoading: boolean;
    handleClickCancel: () => void;
    handleClickConfirm: (value: string) => void;
}

export const LinkModal = (props: Props) => {

    const {
        open,
        title,
        description,
        inputLabel,
        inputPlaceholder,
        inputDefaultValue,
        isLoading,
        handleClickCancel,
        handleClickConfirm
    } = props;

    const [error, setError] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        const value = inputRef.current?.value.trim() ?? undefined;
        if (!value || !value.length) {
            setError("Aségurate de proporcionar una URL");
            return;
        }
        if (!isValidUrl(value ?? '')) {
            setError("Aségurate de que el enlace proporcionado contiene https y es un enlace válido");
            return;
        }
        setError("");
        handleClickConfirm(value);
    }

    return (
        <>
            <AlertDialog open={open}>
                <AlertDialogContent className={cn("!max-w-md")}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                        <div className="mx-0 w-full flex flex-col justify-center pt-4 mt-4 mb-2 border-t border-border">
                            <label className="text-sm font-medium text-foreground mb-3 block">{inputLabel}</label>
                            <Input
                                type="text"
                                ref={inputRef}
                                defaultValue={inputDefaultValue}
                                placeholder={inputPlaceholder}
                                disabled={isLoading}
                                onKeyDown={(event) => {
                                    if (event.key !== "Enter")
                                        return;
                                    event.preventDefault();
                                    handleSubmit();
                                }}
                                className={cn("pill-input h-10 w-full pl-8 pr-12 text-sm")}
                            />
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleClickCancel}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Agregar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
