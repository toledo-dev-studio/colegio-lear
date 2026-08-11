import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { ChatMessageResponse } from "@/interfaces/responses/chat-message.response";

export const CHAT_PAGE_SIZE = 20;

interface Options {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
    page: number;
    pageSize?: number;
}

export const getChatMessagesAsync = async ({ studentId, enrollmentId, teacherId, page, pageSize = CHAT_PAGE_SIZE }: Options): Promise<PagedResponse<ChatMessageResponse>> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<ChatMessageResponse[]>("/chats/messages.json");

        const sortedMessages = data
            .filter((message) => message.chatId === teacherId)
            .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

        const totalPages = Math.max(1, Math.ceil(sortedMessages.length / pageSize));
        const requestedPage = Math.min(page, totalPages);
        const end = sortedMessages.length - (requestedPage - 1) * pageSize;
        const start = Math.max(0, end - pageSize);

        const pagedMessages = sortedMessages.slice(start, end);

        return {
            data: pagedMessages,
            totalPages,
            currentPage: requestedPage,
            itemsCount: pagedMessages.length
        };
    }

    const { data } = await api.get<PagedResponse<ChatMessageResponse>>(`/students/${studentId}/enrollments/${enrollmentId}/chats/${teacherId}/messages`, {
        params: {
            page,
            pageSize
        }
    });

    return data;
}