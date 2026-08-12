import { useState } from "react";
import { MessageSquare } from "lucide-react";

import { useChatsPage } from "../hooks/useChatsPage";
import { ChatWindow } from "../components/chat-window/ChatWindow";
import { ChatsSkeleton } from "../components/chats-skeleton/ChatsSkeleton";
import { ChatEmptyState } from "../components/chat-empty-state/ChatEmptyState";
import { ChatsConversationsList } from "../components/chats-conversations-list/ChatsConversationsList";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { CardHeader } from "@/shared/components/card-header/CardHeader";

export const ChatsPage = () => {
    const { context, queries } = useChatsPage();
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>();

    const selectedChat = queries.chatsQuery.data.find((chat) => chat.teacherId === selectedTeacherId);

    return (
        <section className="page-main-section">

            {/* Page title */}
            <ModulePageTitle
                icon={MessageSquare}
                badge="Mensajes"
                title="Chats, "
                description="Comunícate directamente con los docentes que te imparten clases en este ciclo escolar, consulta el historial y envía mensajes de texto."
                studentName={context.student?.fullName}
                cycle={context.academicCycle}
            />

            {/* Chats */}
            <section className="card">

                <CardHeader
                    icon={MessageSquare}
                    title="Mensajes con tus docentes"
                    description="Consulta tus conversaciones y envía mensajes de texto a los docentes que te imparten clases en este ciclo escolar."
                    tone="sky"
                />

                <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-128">
                    {
                        queries.chatsQuery.isLoading ? (
                            <ChatsSkeleton />
                        ) : queries.chatsQuery.data.length === 0 ? (
                            <ChatEmptyState
                                className="min-h-128"
                                title="Aún no tienes conversaciones"
                                description="Cuando tus docentes te envíen mensajes, aparecerán aquí para que puedas responderles."
                            />
                        ) : (
                            <>
                                {/* Conversations list */}
                                <aside className={`w-full lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 border-border overflow-y-auto max-h-[70vh] lg:max-h-[70vh] ${selectedChat ? "hidden lg:block" : "block"}`}>
                                    <ChatsConversationsList
                                        chats={queries.chatsQuery.data}
                                        selectedTeacherId={selectedTeacherId}
                                        onSelectChat={setSelectedTeacherId}
                                    />
                                </aside>

                                {/* Chat window */}
                                <main className={`flex-1 min-w-0 lg:border-l border-border ${selectedChat ? "flex" : "hidden lg:flex"}`}>
                                    {selectedChat ? (
                                        <ChatWindow
                                            chat={selectedChat}
                                            studentId={context.student?.id!}
                                            enrollmentId={context.enrollment?.id!}
                                            onBack={() => setSelectedTeacherId(undefined)}
                                        />
                                    ) : (
                                        <ChatEmptyState
                                            title="Selecciona una conversación"
                                            description="Elige un docente de la lista para consultar y enviar mensajes."
                                        />
                                    )}
                                </main>
                            </>
                        )
                    }
                </section>
            </section>

        </section>
    );
}