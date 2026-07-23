import type { PropsWithChildren } from "react";

import { Button } from "@/shared/ui/button";
import { Spinner } from "../spinner/Spinner";
import { FormPermissionProvider } from "./FormPermissionContext";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";

interface Props extends PropsWithChildren {
    isSubmitting: boolean;
    moduleKey: ModuleKey;
    showCancelButton?: boolean;
    onSubmit: () => void;
    onCancel?: () => void;
}

export const Form = ({ isSubmitting, moduleKey, showCancelButton = true, onSubmit, onCancel, children }: Props) => {
    const canWrite = usePermission(moduleKey, "can-write");

    return (
        <FormPermissionProvider disabled={!canWrite}>
            <form onSubmit={onSubmit}>
                <fieldset disabled={!canWrite}>
                    {/* Form content */}
                    {children}
                </fieldset>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">

                    {showCancelButton &&
                        <Button type="button" aria-label="cancel" variant={"ghost"} onClick={onCancel && onCancel}>
                            Cancelar
                        </Button>
                    }
                    {
                        canWrite && (
                            <Button type="submit" disabled={!canWrite} aria-label="save-record">
                                Guardar
                                {
                                    isSubmitting && (<Spinner variant="primary" className="ml-4" />)
                                }
                            </Button>
                        )
                    }
                </section>
            </form>
        </FormPermissionProvider>
    );
};