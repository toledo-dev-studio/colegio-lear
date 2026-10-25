import { X } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";
import type { PropsWithChildren } from "react";

interface ButtonProps {
    label?: string;
    show?: boolean;
    disabled?: boolean;
    type?: "submit" | "button";
    handleClick?: () => void;
}

interface Props extends PropsWithChildren {
    title: string;
    handleClickClose: () => void;
    cancelButton: ButtonProps,
    submitButton: ButtonProps;
}

export const SidePanel = (props: Props) => {

    const { title, handleClickClose, cancelButton, submitButton, children } = props;

    return (
        <>
            <section className="fixed inset-0 z-50 flex justify-end">

                <section className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />

                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">

                    {/* Side panel header */}
                    <header className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            {title}
                        </h3>
                        <span onClick={handleClickClose} className="flex items-center justify-center cursor-pointer min-w-10 min-h-10 bg-card text-foreground px-0!">
                            <X className="w-5! h-5! text-muted-foreground" />
                        </span>
                    </header>

                    {/* Component content */}
                    <section className="flex-1 overflow-y-auto px-10 py-10 space-y-5">

                        <section className="flex flex-col gap-8">

                            {children}

                        </section>

                    </section>

                    {/* Actions section */}
                    <section className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">

                        {
                            cancelButton.show && (
                                <Button type={cancelButton.type} disabled={cancelButton.disabled} variant={"ghost"} onClick={cancelButton.handleClick}>
                                    {cancelButton.label}
                                </Button>
                            )
                        }

                        {
                            submitButton.show && (
                                <Button type={submitButton.type} disabled={submitButton.disabled} variant={"default"} onClick={submitButton.handleClick}>
                                    {submitButton.label}
                                </Button>
                            )
                        }

                    </section>

                </aside>

            </section>
        </>
    )
}
