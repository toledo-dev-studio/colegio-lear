import type { PropsWithChildren } from "react";

import { Button } from "@/shared/shadcn/ui/button";
import { Spinner } from "../spinner/Spinner";

interface Props extends PropsWithChildren {
    isSubmitting: boolean;
    showCancelButton?: boolean;
    onSubmit: () => void;
    onCancel?: () => void;
}

export const Form = ({ isSubmitting, showCancelButton = true, onSubmit, onCancel, children }: Props) => {
    return (
        <form onSubmit={onSubmit}>
            {/* Form content */}
            {children}

            {/* Actions Buttons */}
            <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">

                {showCancelButton &&
                    <Button type="button" aria-label="cancel" variant={"ghost"} onClick={onCancel && onCancel}>
                        Cancelar
                    </Button>
                }
                <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                    Guardar
                    {
                        isSubmitting && (<Spinner variant="primary" className="ml-4" />)
                    }
                </Button>
            </section>
        </form>
    );
};