import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

interface Props {
    title: string;
    subtitle?: string;
}

export const ColegioLearLogo = ({ title = "COLEGIO LEAR", subtitle }: Props) => {
    return (
        <Link to="/dashboard" className="h-20 flex items-center gap-4 px-7 border-b border-border">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="font-heading font-extrabold tracking-tight text-foreground text-lg">{title}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{subtitle}</span>
            </div>
        </Link>
    )
}
