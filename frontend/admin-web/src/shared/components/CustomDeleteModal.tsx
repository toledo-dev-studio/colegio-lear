import { Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/shared/ui/alert-dialog";
import { Spinner } from "./spinner/Spinner";

interface Props {
  open: boolean;
  title: string;
  message: string;
  isLoading: boolean;
  handleClickConfirm: () => void;
  handleClickCancel: () => void;
}

export const CustomDeleteModal = ({ open, title, message, isLoading, handleClickConfirm, handleClickCancel }: Props) => {

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={"pt-10"} size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash />
          </AlertDialogMedia>
          <AlertDialogTitle>{ title }</AlertDialogTitle>
          <AlertDialogDescription>
            { message }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={"px-10"} variant="outline" onClick={handleClickCancel} disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className={"px-10"} variant="destructive" onClick={handleClickConfirm} disabled={isLoading}>
            Si, eliminar
            { isLoading && <Spinner variant="destructive" /> }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
