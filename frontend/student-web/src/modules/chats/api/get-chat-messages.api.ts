import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { ChatMessageResponse } from "@/interfaces/responses/chat-message.response";

interface Options {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
}

export const getChatMessagesAsync = async ({ studentId, enrollmentId, teacherId }: Options): Promise<ChatMessageResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<ChatMessageResponse[]>("/chats/messages.json");
        return data.filter((message) => message.chatId === teacherId);
    }

    const { data } = await api.get<ChatMessageResponse[]>(`/students/${studentId}/enrollments/${enrollmentId}/chats/${teacherId}/messages`);

    return data;
}