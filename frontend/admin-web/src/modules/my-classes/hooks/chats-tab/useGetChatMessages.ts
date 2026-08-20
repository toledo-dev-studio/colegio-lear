import { useInfiniteQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_CHAT_MESSAGES_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";
import { CHAT_PAGE_SIZE, getChatMessagesAsync } from "../../api/chats-tab/get-chat-messages.api";

export const CHAT_POLLING_INTERVAL = 30_000;

interface Options {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
}

export const getChatMessagesQueryKey = ({ studentId, enrollmentId, teacherId }: Options) =>
    [GET_CHAT_MESSAGES_QUERY_KEY, { studentId, enrollmentId, teacherId, pageSize: CHAT_PAGE_SIZE }];

export const useGetChatMessages = ({ studentId, enrollmentId, teacherId }: Options) => {
    const queryResult = useInfiniteQuery({
        queryKey: getChatMessagesQueryKey({ studentId, enrollmentId, teacherId }),
        queryFn: ({ pageParam }) => getChatMessagesAsync({ studentId, enrollmentId, teacherId, page: pageParam, pageSize: CHAT_PAGE_SIZE }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
        staleTime: FIVE_MINUTES_STALE_TIME,
        refetchInterval: CHAT_POLLING_INTERVAL,
    });

    const messages = (queryResult.data?.pages ?? []).slice().reverse().flatMap((page) => page.data);

    return { ...queryResult, data: messages };
}