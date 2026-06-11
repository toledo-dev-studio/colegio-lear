interface Props {
    title: string;
    description?: string;
}

export const TabSectionTitle = ({ title, description }: Props) => {
    return (
        <>
            <section className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                <h2 className="w-full text-muted-foreground uppercase font-semibold">
                    { title }
                </h2>
                <p className="text-sm text-muted-foreground">
                    { description }
                </p>
            </section>
        </>
    )
}
