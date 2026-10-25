import { cn } from "@/lib/extensions/utils";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Props {
    student: StudentResponse;
    className?: string;
}

export const StudentAvatar = ({ student, className }: Props) => {
    const initials = `${student.name.charAt(0)}${student.firstLastName.charAt(0)}`.toUpperCase();

    return student.image ? (
        <img
            src={student.image}
            alt={`${student.name} ${student.firstLastName}`}
            className={cn("w-12 h-12 rounded-full object-cover shrink-0", className)}
        />
    ) : (
        <div className={cn("w-12 h-12 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center font-semibold text-sm shrink-0", className)}>
            {initials}
        </div>
    );
}