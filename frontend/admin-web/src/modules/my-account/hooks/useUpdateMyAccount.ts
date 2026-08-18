import { useMutation } from "@tanstack/react-query";

import { updateMyAccountAsync } from "../api/update-my-account.api";

export const useUpdateMyAccount = () => {
    return useMutation({
        mutationFn: updateMyAccountAsync
    });
}
