import type { PropsWithChildren } from "react";

import { Loader } from "../components/loader/Loader";
import { useLoaderStore } from "../stores/LoaderStore";

export const LoaderContextProvider = ({ children }: PropsWithChildren) => {

    const { isLoading, title, subTitle } = useLoaderStore();

    return (
        <>
            {isLoading && <Loader className="fixed" title={title!} subtitle={subTitle} />}
            {children}
        </>

    );
}
