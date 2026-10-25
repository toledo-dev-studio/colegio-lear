import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { ChatResponse } from "@/interfaces/responses/chat.response";
import type { ChatMessageResponse } from "@/interfaces/responses/chat-message.response";
import { GET_CHATS_QUERY_KEY } from "@/lib/queries-key/chats-queries-key";
import { sendChatMessageAsync } from "../api/send-chat-message.api";
import { getChatMessagesQueryKey } from "./useGetChatMessages";

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
    previousPages: InfiniteData<PagedResponse<ChatMessageResponse>> | undefined;
    temporaryMessageId: string;
}

export const useSendChatMessage = ({ studentId, enrollmentId }: Options) => {
    const queryClient = useQueryClient();

    return useMutation<ChatMessageResponse, Error, MutationOptions, MutationContext | undefined>({
        mutationFn: ({ teacherId, content }) => sendChatMessageAsync({ studentId, enrollmentId, teacherId, content }),
        onMutate: async ({ teacherId, content }) => {
            const queryKey = getChatMessagesQueryKey({ studentId, enrollmentId, teacherId });
            const temporaryMessage: ChatMessageResponse = {
                id: `temp-${crypto.randomUUID()}`,
                chatId: teacherId,
                sentBy: "student",
                content,
                sentAt: new Date().toISOString()
            };

            await queryClient.cancelQueries({ queryKey });

            const previousPages = queryClient.getQueryData<InfiniteData<PagedResponse<ChatMessageResponse>>>(queryKey);

            if (previousPages) {
                const pages = previousPages.pages.map((page, index) =>
                    index === 0
                        ? { ...page, data: [...page.data, temporaryMessage], itemsCount: page.itemsCount + 1 }
                        : page
                );

                queryClient.setQueryData(queryKey, { ...previousPages, pages });
            }

            return { queryKey, previousPages, temporaryMessageId: temporaryMessage.id };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousPages) {
                queryClient.setQueryData(context.queryKey, context.previousPages);
            }
        },
        onSuccess: (message, { teacherId }, context) => {
            if (context) {
                const current = queryClient.getQueryData<InfiniteData<PagedResponse<ChatMessageResponse>>>(context.queryKey);

                if (current) {
                    const pages = current.pages.map((page, index) =>
                        index === 0
                            ? { ...page, data: page.data.map((item) => item.id === context.temporaryMessageId ? message : item) }
                            : page
                    );

                    queryClient.setQueryData(context.queryKey, { ...current, pages });
                }
            }

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