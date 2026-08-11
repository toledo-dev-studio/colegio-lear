import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ChatResponse } from "@/interfaces/responses/chat.response";
import type { ChatMessageResponse } from "@/interfaces/responses/chat-message.response";
import { GET_CHATS_QUERY_KEY, GET_CHAT_MESSAGES_QUERY_KEY } from "@/lib/queries-key/chats-queries-key";
import { sendChatMessageAsync } from "../api/send-chat-message.api";

interface Options {
    studentId: string;
    enrollmentId: string;
}

interface MutationOptions {
    teacherId: string;
    content: string;
}

interface MutationContext {
    queryKey: unknown[];
    previousMessages: ChatMessageResponse[];
    temporaryMessageId: string;
}

export const useSendChatMessage = ({ studentId, enrollmentId }: Options) => {
    const queryClient = useQueryClient();

    return useMutation<ChatMessageResponse, Error, MutationOptions, MutationContext | undefined>({
        mutationFn: ({ teacherId, content }) => sendChatMessageAsync({ studentId, enrollmentId, teacherId, content }),
        onMutate: async ({ teacherId, content }) => {
            const queryKey = [GET_CHAT_MESSAGES_QUERY_KEY, { studentId, enrollmentId, teacherId }];
            const temporaryMessage: ChatMessageResponse = {
                id: `temp-${crypto.randomUUID()}`,
                chatId: teacherId,
                sentBy: "student",
                content,
                sentAt: new Date().toISOString()
            };

            await queryClient.cancelQueries({ queryKey });

            const previousMessages = queryClient.getQueryData<ChatMessageResponse[]>(queryKey) ?? [];
            queryClient.setQueryData<ChatMessageResponse[]>(queryKey, [...previousMessages, temporaryMessage]);

            return { queryKey, previousMessages, temporaryMessageId: temporaryMessage.id };
        },
        onError: (_error, _variables, context) => {
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousMessages);
            }
        },
        onSuccess: (message, { teacherId }, context) => {
            if (!context) return;

            const current = queryClient.getQueryData<ChatMessageResponse[]>(context.queryKey) ?? [];
            queryClient.setQueryData<ChatMessageResponse[]>(context.queryKey, [
                ...current.filter((item) => item.id !== context.temporaryMessageId),
                message
            ]);

            const chatsQueryKey = [GET_CHATS_QUERY_KEY, { studentId, enrollmentId }];
            const chats = queryClient.getQueryData<ChatResponse[]>(chatsQueryKey) ?? [];
            queryClient.setQueryData<ChatResponse[]>(chatsQueryKey, chats.map((chat) =>
                chat.teacherId === teacherId
                    ? { ...chat, lastMessage: message.content, lastMessageAt: message.sentAt, unreadCount: 0 }
                    : chat
            ));
        }
    });
}