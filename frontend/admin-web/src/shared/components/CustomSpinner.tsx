
import { cn } from "@/lib/utils";

interface Props {
    className?: string,
    variant: 'primary' | 'destructive';
}

export const CustomSpinner = ({ className, variant }: Props) => {
    return (
        <div className={
            cn("h-4 w-4 animate-spin rounded-full border-2 border-t-transparent",
                variant === "primary" && "border-white",
                variant === "destructive" && "border-destructive",
                className
            )}>
        </div>
    );
}
