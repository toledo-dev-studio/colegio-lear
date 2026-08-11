import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_CHAT_MESSAGES_QUERY_KEY } from "@/lib/queries-key/chats-queries-key";
import { getChatMessagesAsync } from "../api/get-chat-messages.api";

interface Options {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
}

export const useGetChatMessages = ({ studentId, enrollmentId, teacherId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_CHAT_MESSAGES_QUERY_KEY, { studentId, enrollmentId, teacherId }],
        queryFn: () => getChatMessagesAsync({ studentId, enrollmentId, teacherId }),
        staleTime: FIVE_MINUTES_STALE_TIME,
    });

    return { ...queryResult, data: queryResult.data ?? [] };
}