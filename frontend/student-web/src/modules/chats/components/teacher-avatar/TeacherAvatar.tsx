import { cn } from "@/lib/extensions/utils";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Props {
    teacher: EmployeeResponse;
    className?: string;
}

export const TeacherAvatar = ({ teacher, className }: Props) => {
    const initials = `${teacher.name.charAt(0)}${teacher.firstLastName.charAt(0)}`.toUpperCase();

    return teacher.avatar ? (
        <img
            src={teacher.avatar}
            alt={`${teacher.name} ${teacher.firstLastName}`}
            className={cn("w-12 h-12 rounded-full object-cover shrink-0", className)}
        />
    ) : (
        <div className={cn("w-12 h-12 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center font-semibold text-sm shrink-0", className)}>
            {initials}
        </div>
    );
}