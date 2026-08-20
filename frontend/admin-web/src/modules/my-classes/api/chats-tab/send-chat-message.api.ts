import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SendChatMessageRequest } from "@/interfaces/requests/send-chat-message.request";
import type { ChatMessageResponse } from "@/interfaces/responses/chat-message.response";
import { persistMockChatMessage } from "./get-chat-messages.api";

interface Options {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
    content: string;
}

export const sendChatMessageAsync = async ({ studentId, enrollmentId, teacherId, content }: Options): Promise<ChatMessageResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const message: ChatMessageResponse = {
            id: crypto.randomUUID(),
            chatId: teacherId,
            sentBy: "teacher",
            content,
            sentAt: new Date().toISOString()
        };

        persistMockChatMessage({ ...message, enrollmentId });

        return message;
    }

    const payload: SendChatMessageRequest = { content };

    const { data } = await api.post<ChatMessageResponse>(`/students/${studentId}/enrollments/${enrollmentId}/chats/${teacherId}/messages`, payload);

    return data;
}