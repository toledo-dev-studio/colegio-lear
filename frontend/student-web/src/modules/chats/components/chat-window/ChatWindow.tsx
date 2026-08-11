import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Button } from "@/shared/shadcn/ui/button";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import type { ChatResponse } from "@/interfaces/responses/chat.response";
import { useGetChatMessages } from "../../hooks/useGetChatMessages";
import { useSendChatMessage } from "../../hooks/useSendChatMessage";
import { TeacherAvatar } from "../teacher-avatar/TeacherAvatar";
import { ChatMessageBubble } from "../chat-message-bubble/ChatMessageBubble";

interface Props {
    chat: ChatResponse;
    studentId: string;
    enrollmentId: string;
    onBack?: () => void;
}

const getTeacherFullName = (chat: ChatResponse): string => {
    const { teacher } = chat;
    return `${teacher.name} ${teacher.firstLastName}${teacher.secondLastName ? ` ${teacher.secondLastName}` : ""}`;
};

export const ChatWindow = ({ chat, studentId, enrollmentId, onBack }: Props) => {
    const { data: messages, isLoading } = useGetChatMessages({ studentId, enrollmentId, teacherId: chat.teacherId });
    const sendMessageMutation = useSendChatMessage({ studentId, enrollmentId });

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [draft, setDraft] = useState("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = () => {
        const content = draft.trim();

        if (!content || sendMessageMutation.isPending) return;

        sendMessageMutation.mutate({ teacherId: chat.teacherId, content });
        setDraft("");
    };

    const lastMessage = messages[messages.length - 1];
    const isSending = sendMessageMutation.isPending && !!lastMessage && lastMessage.id.startsWith("temp-");

    return (
        <section className="flex flex-col flex-1 min-w-0">

            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
                {
                    onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="lg:hidden shrink-0"
                            aria-label="Volver a la lista de conversaciones"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )
                }
                <TeacherAvatar teacher={chat.teacher} className="w-10 h-10" />
                <section className="min-w-0">
                    <p className="text-sm font-heading font-bold text-foreground truncate">{getTeacherFullName(chat)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                        Docente de {chat.schoolSubject.name}
                    </p>
                </section>
            </header>

            {/* Messages */}
            <section className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-64">
                {isLoading ? (
                    <>
                        <Skeleton className="h-10 w-56 self-start rounded-2xl" />
                        <Skeleton className="h-10 w-64 self-end rounded-2xl" />
                        <Skeleton className="h-10 w-48 self-start rounded-2xl" />
                    </>
                ) : messages.length === 0 ? (
                    <section className="flex-1 flex flex-col items-center justify-center gap-y-2 text-center">
                        <p className="text-sm text-muted-foreground">Aún no hay mensajes en esta conversación.</p>
                        <p className="text-xs text-muted-foreground">Envía el primer mensaje para saludar a tu docente.</p>
                    </section>
                ) : (
                    messages.map((message) => (
                        <ChatMessageBubble
                            key={message.id}
                            message={message}
                            isPending={isSending && message.id === lastMessage.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </section>

            {/* Input */}
            <footer className="flex items-end gap-2 px-4 py-3 border-t border-border bg-muted/20">
                <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Escribe un mensaje…"
                    rows={1}
                    className="min-h-12 max-h-32 resize-none"
                />
                <Button
                    onClick={handleSend}
                    disabled={!draft.trim() || sendMessageMutation.isPending}
                    className="shrink-0 h-10 w-10 rounded-full px-0"
                    aria-label="Enviar mensaje"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </footer>
        </section>
    );
}