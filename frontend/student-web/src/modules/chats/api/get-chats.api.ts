import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { ChatResponse } from "@/interfaces/responses/chat.response";

interface Options {
    studentId: string;
    enrollmentId: string;
}

export const getChatsAsync = async ({ studentId, enrollmentId }: Options): Promise<ChatResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<ChatResponse[]>("/chats/chats.json");
        return data;
    }

    const { data } = await api.get<ChatResponse[]>(`/students/${studentId}/enrollments/${enrollmentId}/chats`);

    return data;
}