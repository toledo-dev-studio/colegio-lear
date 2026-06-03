import { Info, Trash } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/shared/ui/alert-dialog";
import { CustomSpinner } from "../CustomSpinner";
import { cn } from "@/lib/extensions/utils";

interface ButtonConfig {
    label: string;
    onClick: () => void
}

interface Props {
    open: boolean;
    type: "delete" | "info";
    title: string;
    message: string;
    isLoading: boolean;
    confirmButton?: ButtonConfig;
    cancelButton?: ButtonConfig;
}

export const Modal = ({ open, type, title, message, isLoading, confirmButton, cancelButton }: Props) => {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent className={"pt-10"} size="default">
                <AlertDialogHeader>
                    <AlertDialogMedia className={cn(
                        type === "info" && "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
                        type === "delete" && "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
                    )}>
                        {type === "info" && (<Info />)}
                        {type === "delete" && (<Trash />)}
                    </AlertDialogMedia>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {
                        cancelButton && (<AlertDialogCancel className={"px-10"} variant="outline" onClick={cancelButton.onClick} disabled={isLoading}>{cancelButton.label}</AlertDialogCancel>)
                    }
                    {
                        confirmButton && (
                            <AlertDialogAction className={"px-10"} variant={type === "info" ? "default" : type === "delete" ? "destructive" : "default"} onClick={confirmButton.onClick} disabled={isLoading}>
                                { confirmButton.label }
                                {isLoading && <CustomSpinner variant={type === "info" ? "primary" : type === "delete" ? "destructive" : "primary"} />}
                            </AlertDialogAction>
                        )
                    }
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
