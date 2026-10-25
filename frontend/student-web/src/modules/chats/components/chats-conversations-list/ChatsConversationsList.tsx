import { cn } from "@/lib/extensions/utils";
import type { ChatResponse } from "@/interfaces/responses/chat.response";
import { TeacherAvatar } from "@/shared/components/teacher-avatar/TeacherAvatar";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Props {
    chats: ChatResponse[];
    selectedTeacherId?: string;
    onSelectChat: (teacherId: string) => void;
}

const formatChatTime = (dateString?: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return new Intl.DateTimeFormat("es-MX", isToday
        ? { hour: "2-digit", minute: "2-digit" }
        : { day: "2-digit", month: "2-digit" }
    ).format(date);
};

const getTeacherFullName = (teacher: EmployeeResponse): string => {
    return `${teacher.name} ${teacher.firstLastName}${teacher.secondLastName ? ` ${teacher.secondLastName}` : ""}`;
};

type TeacherGroup = {
    teacherId: string;
    teacher: EmployeeResponse;
    subjects: string[];
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount?: number;
};

export const ChatsConversationsList = ({ chats, selectedTeacherId, onSelectChat }: Props) => {
    const teacherGroups = chats.reduce<TeacherGroup[]>((acc, chat) => {
        const existing = acc.find((g) => g.teacherId === chat.teacherId);
        if (existing) {
            if (!existing.subjects.includes(chat.schoolSubject.name)) {
                existing.subjects.push(chat.schoolSubject.name);
            }
        } else {
            acc.push({
                teacherId: chat.teacherId,
                teacher: chat.teacher,
                subjects: [chat.schoolSubject.name],
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                unreadCount: chat.unreadCount,
            });
        }
        return acc;
    }, []);

    return (
        <section className="flex flex-col divide-y divide-border">
            {teacherGroups.map((teacherChat) => {
                const isSelected = teacherChat.teacherId === selectedTeacherId;

                return (
                    <button
                        key={teacherChat.teacherId}
                        type="button"
                        onClick={() => onSelectChat(teacherChat.teacherId)}
                        className={cn(
                            "flex items-center gap-3 w-full text-left px-4 py-3 transition-colors hover:bg-muted/40 cursor-pointer",
                            isSelected && "bg-muted/60 hover:bg-muted/60"
                        )}
                    >
                        <TeacherAvatar teacher={teacherChat.teacher} />

                        <section className="min-w-0 flex-1">
                            <section className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {getTeacherFullName(teacherChat.teacher)}
                                </p>
                                {
                                    teacherChat.lastMessageAt && (
                                        <p className="text-[10px] text-muted-foreground shrink-0">
                                            {formatChatTime(teacherChat.lastMessageAt)}
                                        </p>
                                    )
                                }
                            </section>
                            <section className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="text-xs text-muted-foreground truncate">
                                    {teacherChat.lastMessage ?? "Sin mensajes todavía"}
                                </p>
                                {
                                    (teacherChat.unreadCount ?? 0) > 0 && (
                                        <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-sky-500/15 text-sky-600 text-[10px] font-bold flex items-center justify-center">
                                            {teacherChat.unreadCount}
                                        </span>
                                    )
                                }
                            </section>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                                {teacherChat.subjects.join(", ")}
                            </p>
                        </section>
                    </button>
                );
            })}
        </section>
    );
};
