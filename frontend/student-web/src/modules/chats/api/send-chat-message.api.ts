import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SendChatMessageRequest } from "@/interfaces/requests/send-chat-message.request";
import type { ChatMessageResponse } from "@/interfaces/responses/chat-message.response";

interface Options {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
    content: string;
}

export const sendChatMessageAsync = async ({ studentId, enrollmentId, teacherId, content }: Options): Promise<ChatMessageResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        return {
            id: crypto.randomUUID(),
            chatId: teacherId,
            sentBy: "student",
            content,
            sentAt: new Date().toISOString()
        };
    }

    const payload: SendChatMessageRequest = { content };

    const { data } = await api.post<ChatMessageResponse>(`/students/${studentId}/enrollments/${enrollmentId}/chats/${teacherId}/messages`, payload);

    return data;
}