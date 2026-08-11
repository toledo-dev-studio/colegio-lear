import type { PropsWithChildren } from "react";

import { Loader } from "../shared/components/loader/Loader";
import { useLoaderStore } from "@/stores/loader-store/LoaderStore";

export const LoaderContextProvider = ({ children }: PropsWithChildren) => {

    const { isLoading, title, subTitle } = useLoaderStore();

    return (
        <>
            {isLoading && <Loader className="fixed" title={title!} subtitle={subTitle} />}
            {children}
        </>

    );
}
