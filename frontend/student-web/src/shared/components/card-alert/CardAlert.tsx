import { InfoIcon } from "lucide-react";

interface Props {
    type: "info",
    title: string;
    message: string;
}

export const CardAlert = ({ type, title, message }: Props) => {
    return (
        <>
            <section className="flex flex-col gap-y-4">
                <div className="flex flex-col items-start gap-y-4 border-b border-border mt-2 mb-2 border-solid border p-6 rounded-xl bg-primary/90 dark:bg-primary/20">
                    <h2 className="w-full text-white flex gap-x-4 items-center uppercase">
                        { type === "info" && <InfoIcon /> }
                        { title }
                    </h2>
                    <p className="text-sm text-white">
                        { message }
                    </p>
                </div>
            </section>
        </>
    )
}
