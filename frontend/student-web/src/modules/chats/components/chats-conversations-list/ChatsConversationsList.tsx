import { cn } from "@/lib/extensions/utils";
import type { ChatResponse } from "@/interfaces/responses/chat.response";
import { TeacherAvatar } from "../teacher-avatar/TeacherAvatar";

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

const getTeacherFullName = (chat: ChatResponse): string => {
    const { teacher } = chat;
    return `${teacher.name} ${teacher.firstLastName}${teacher.secondLastName ? ` ${teacher.secondLastName}` : ""}`;
};

export const ChatsConversationsList = ({ chats, selectedTeacherId, onSelectChat }: Props) => {
    return (
        <section className="flex flex-col divide-y divide-border">
            {chats.map((chat) => {
                const isSelected = chat.teacherId === selectedTeacherId;

                return (
                    <button
                        key={chat.teacherId}
                        type="button"
                        onClick={() => onSelectChat(chat.teacherId)}
                        className={cn(
                            "flex items-center gap-3 w-full text-left px-4 py-3 transition-colors hover:bg-muted/40 cursor-pointer",
                            isSelected && "bg-muted/60 hover:bg-muted/60"
                        )}
                    >
                        <TeacherAvatar teacher={chat.teacher} />

                        <section className="min-w-0 flex-1">
                            <section className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {getTeacherFullName(chat)}
                                </p>
                                {
                                    chat.lastMessageAt && (
                                        <p className="text-[10px] text-muted-foreground shrink-0">
                                            {formatChatTime(chat.lastMessageAt)}
                                        </p>
                                    )
                                }
                            </section>
                            <section className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="text-xs text-muted-foreground truncate">
                                    {chat.lastMessage ?? "Sin mensajes todavía"}
                                </p>
                                {
                                    (chat.unreadCount ?? 0) > 0 && (
                                        <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-sky-500/15 text-sky-600 text-[10px] font-bold flex items-center justify-center">
                                            {chat.unreadCount}
                                        </span>
                                    )
                                }
                            </section>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                                {chat.schoolSubject.name}
                            </p>
                        </section>
                    </button>
                );
            })}
        </section>
    );
}