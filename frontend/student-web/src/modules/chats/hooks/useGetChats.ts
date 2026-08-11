import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_CHATS_QUERY_KEY } from "@/lib/queries-key/chats-queries-key";
import { getChatsAsync } from "../api/get-chats.api";

interface Options {
    studentId: string;
    enrollmentId: string;
}

export const useGetChats = ({ studentId, enrollmentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_CHATS_QUERY_KEY, { studentId, enrollmentId }],
        queryFn: () => getChatsAsync({ studentId, enrollmentId }),
        staleTime: FIVE_MINUTES_STALE_TIME,
    });

    return { ...queryResult, data: queryResult.data ?? [] };
}