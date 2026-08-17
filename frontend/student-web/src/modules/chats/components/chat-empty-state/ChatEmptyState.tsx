import { MessageSquareOff } from "lucide-react";

interface Props {
    title: string;
    description: string;
    className?: string;
}

export const ChatEmptyState = ({ title, description, className }: Props) => {
    return (
        <section className={`flex-1 flex flex-col items-center justify-center gap-y-3 text-center p-8 min-h-56 ${className ?? ""}`}>
            <div className="w-14 h-14 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center">
                <MessageSquareOff className="w-6 h-6" />
            </div>
            <p className="text-sm font-heading font-bold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
        </section>
    );
}