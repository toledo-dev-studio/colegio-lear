import { useMutation } from "@tanstack/react-query";

import { updateMyAccountActionAsync } from "../actions/update-my-account.action";

export const useUpdateMyAccount = () => {
    return useMutation({
        mutationFn: updateMyAccountActionAsync
    });
}
