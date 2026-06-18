interface Props {
    title: string;
    subtitle?: string;
    testid?: string;
}

export const PageTitle = ({ title, subtitle }: Props) => {
    return (
        <div className="flex items-start gap-4 mb-8 relative">
            <div className="page-title-bar" />
            <div className="flex flex-col ml-7">
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground tracking-tight uppercase">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
            </div>
        </div>
    );
}
