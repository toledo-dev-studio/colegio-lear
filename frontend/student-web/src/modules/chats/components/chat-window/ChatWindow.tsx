import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, History, Send } from "lucide-react";

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
    const { data: messages, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetChatMessages({ studentId, enrollmentId, teacherId: chat.teacherId });
    const sendMessageMutation = useSendChatMessage({ studentId, enrollmentId });

    const messagesSectionRef = useRef<HTMLElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const anchorMessageIdRef = useRef<string | undefined>(undefined);

    const [draft, setDraft] = useState("");

    useEffect(() => {
        if (!isLoading && !anchorMessageIdRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
    }, [messages.length, isLoading]);

    useLayoutEffect(() => {
        const anchorId = anchorMessageIdRef.current;

        if (!anchorId) return;

        const anchor = messagesSectionRef.current?.querySelector<HTMLElement>(`[data-message-id="${anchorId}"]`);

        anchorMessageIdRef.current = undefined;
        anchor?.scrollIntoView({ block: "start" });
    }, [messages]);

    const handleSend = () => {
        const content = draft.trim();

        if (!content || sendMessageMutation.isPending) return;

        sendMessageMutation.mutate({ teacherId: chat.teacherId, content });
        setDraft("");
    };

    const handleLoadPrevious = () => {
        if (isFetchingNextPage || messages.length === 0) return;

        anchorMessageIdRef.current = messages[0].id;
        fetchNextPage();
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
            <section ref={messagesSectionRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-64">
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
                    <>
                        {
                            hasNextPage && (
                                <section className="flex justify-center -mt-1 mb-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLoadPrevious}
                                        disabled={isFetchingNextPage}
                                        className="h-8 rounded-full px-4 text-xs"
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        {isFetchingNextPage ? "Cargando mensajes anteriores…" : "Ver mensajes anteriores"}
                                    </Button>
                                </section>
                            )
                        }
                        {messages.map((message) => (
                            <ChatMessageBubble
                                key={message.id}
                                message={message}
                                messageId={message.id}
                                isPending={isSending && message.id === lastMessage.id}
                            />
                        ))}
                    </>
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
                    className="min-h-10 max-h-32 resize-none"
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