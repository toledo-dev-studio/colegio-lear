import { GraduationCap } from "lucide-react";

interface Props {
    title: string;
    message: string;
}

export const AuthPagesHeader = ({ title, message }: Props) => {
    return (
        <>
            <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-heading font-extrabold text-xl text-foreground">COLEGIO LEAR</span>
            </div>
            <div className="flex items-start gap-4 mb-8 relative">
                <div className="page-title-bar"></div>
                <div className="ml-8">
                    <h2 className="font-heading text-3xl font-bold text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{message}</p>
                </div>
            </div>
        </>
    )
}
