import { cn } from "@/lib/extensions/utils";

interface Props {
    title: string;
    subtitle?: string;
    className?: string;
}

export const CustomFullScreenLoading = ({ title, subtitle, className }: Props) => {
    return (
        <div className={cn("absolute h-full w-full flex items-center justify-center z-100 bg-card", className)}>
            <div className="flex flex-col items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-lg font-medium mt-6">{title}</p>
                {subtitle && <p className="text-md text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    );
};
