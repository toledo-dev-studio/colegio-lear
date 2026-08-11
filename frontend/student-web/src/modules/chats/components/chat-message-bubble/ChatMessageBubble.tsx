import { cn } from "@/lib/extensions/utils";
import type { ChatMessageResponse } from "@/interfaces/responses/chat-message.response";

interface Props {
    message: ChatMessageResponse;
    isPending?: boolean;
    messageId?: string;
}

export const ChatMessageBubble = ({ message, isPending = false, messageId }: Props) => {
    const isStudent = message.sentBy === "student";

    return (
        <div
            data-message-id={messageId}
            className={cn("flex flex-col max-w-[80%] sm:max-w-[65%]", isStudent ? "self-end items-end" : "self-start items-start")}
        >
            <div className={cn(
                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-foreground break-words",
                isStudent ? "bg-primary/10 rounded-br-sm" : "bg-muted/70 rounded-bl-sm",
                isPending && "opacity-60"
            )}>
                <p>{message.content}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
                {isPending
                    ? "Enviando…"
                    : new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.sentAt))}
            </p>
        </div>
    );
}