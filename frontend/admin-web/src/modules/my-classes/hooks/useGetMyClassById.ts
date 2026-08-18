import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getMyClassByIdAsync } from "../api/get-my-class-by-id.api";
import { GET_MY_CLASS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

interface Options {
    id: string;
}

export const useGetMyClassById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_MY_CLASS_QUERY_KEY, { id }],
        queryFn: () => getMyClassByIdAsync({ id }),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}