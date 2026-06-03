
import { cn } from "@/lib/extensions/utils";

interface Props {
    className?: string,
    variant: "primary" | "destructive" | "foreground";
}

export const CustomSpinner = ({ className, variant }: Props) => {
    return (
        <div className={
            cn("h-4 w-4 animate-spin rounded-full border-2 border-t-transparent",
                variant === "primary" && "border-white",
                variant === "destructive" && "border-destructive",
                variant === "foreground" && "border-muted-foreground/80",
                className
            )}>
        </div>
    );
}
