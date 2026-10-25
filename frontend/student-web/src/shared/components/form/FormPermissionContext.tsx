import { createContext, useContext, type PropsWithChildren } from "react";

interface Context {
    disabled: boolean;
}

const FormPermissionContext =
    createContext<Context>({
        disabled: false
    });

export const FormPermissionProvider = ({ disabled, children }: PropsWithChildren<{ disabled: boolean }>) => {
    return (
        <FormPermissionContext.Provider value={{ disabled }}>
            {children}
        </FormPermissionContext.Provider>
    );
};

export const useFormPermission = () =>
    useContext(FormPermissionContext);

