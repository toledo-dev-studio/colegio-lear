import type { PropsWithChildren } from "react";

import { useLoaderStore } from "../stores/LoaderStore"
import { CustomFullScreenLoading } from "../components/CustomFullScreenLoading";

export const LoaderContextProvider = ({ children }: PropsWithChildren) => {

    const { isLoading, title, subTitle } = useLoaderStore();

    return (
        <>
            {isLoading && <CustomFullScreenLoading className="fixed" title={title!} subtitle={subTitle} />}
            {children}
        </>

    );
}
