import { useEffect, useRef } from "react";
import { Bell, Info, MailOpen, Megaphone, MessageSquare, X } from "lucide-react";

import { formatFriendlyDate } from "@/lib/extensions/formatters";
import type { NotificationResponse } from "@/interfaces/responses/notification.response";

interface Props {
    open: boolean;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    unreadCount: number;
    isLoadingNotifications: boolean;
    notifications: NotificationResponse[],
    onClose: () => void;
    onLoadMore: () => void;
    onNotificationClick: (notification: NotificationResponse) => void;
}

export const NotificationResultsDropdown = ({ open, currentPage, totalPages, totalCount, unreadCount, isLoadingNotifications, notifications, onClose, onLoadMore, onNotificationClick }: Props) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Esc closes; also lock body scroll while overlay is open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    if (!open) return null;

    return (
        <>
            <section className="fixed inset-0 z-50 flex justify-end">
                <section className="absolute inset-0" onClick={onClose} />
            </section>

            <section ref={panelRef} className="fixed inset-x-0 top-20 bottom-0 z-50 flex flex-col border-t border-border bg-card rounded-t-2xl animate-fade-in sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:bottom-auto sm:w-96 sm:rounded-2xl sm:border sm:shadow-xl lg:w-104" data-testid="notifications-panel">

                {/* Header */}
                <section className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-heading font-bold text-foreground">Notificaciones</p>
                            <p className="text-[11px] text-muted-foreground">
                                {unreadCount > 0
                                    ? `${unreadCount} sin leer${totalCount > unreadCount ? ` · ${totalCount} en total` : ""}`
                                    : totalCount === 0
                                        ? "Sin notificaciones"
                                        : "Estás al día"}
                            </p>
                        </div>
                    </div>
                    <button type="button" aria-label="Cerrar notificaciones" onClick={onClose} className="sm:hidden cursor-pointer w-8 h-8 rounded-full hover:bg-card text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </section>

                {/* Body */}
                <section className="flex-1 overflow-y-auto pb-safe sm:max-h-[70vh] sm:pb-0">

                    {/* Loading */}
                    {(isLoadingNotifications && !notifications.length) && (<div className="px-4 py-6 text-sm text-muted-foreground text-center">Cargando…</div>)}

                    {/* No data found */}
                    {(!isLoadingNotifications && totalCount === 0) && (
                        <div className="px-6 py-10 text-center" data-testid="notifications-empty">
                            <MailOpen className="w-9 h-9 text-muted-foreground mx-auto mb-2 opacity-60" />
                            <p className="text-sm font-medium">Sin notificaciones</p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Aquí verás tus notificaciones pendientes en el sistema.
                            </p>
                        </div>
                    )}

                    {/* Notifications list */}
                    {
                        (notifications.length > 0) && (
                            <section data-testid="notifications-group-section">
                                <div className="px-4 py-1.5 top-0 bg-card/95 backdrop-blur border-b border-border/60">
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                        NOTIFICACIONES
                                    </p>
                                </div>
                                {
                                    notifications.map((n) => (
                                        <button
                                            key={n.id}
                                            type="button"
                                            onClick={() => onNotificationClick(n)}
                                            data-testid={`notification-item-${n.id}`}
                                            className={`cursor-pointer w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/40 transition-colors relative ${n.read ? "hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"}`}>

                                            {/* Unread dot indicator */}
                                            {!n.read && (<span className="absolute left-1.5 top-4 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" data-testid={`notification-dot-${n.id}`} />)}

                                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                                                {n.type === "announcement" && <Megaphone className="w-4 h-4" />}
                                                {n.type === "message" && <MessageSquare className="w-4 h-4" />}
                                                {n.type === "info" && <Info className="w-4 h-4" />}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm truncate ${n.read ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                                                        {formatFriendlyDate(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                                                        {n.type === "announcement" && "Campaña pendiente por ver"}
                                                        {n.type === "message" && "Mensajes pendientes"}
                                                        {n.type === "info" && "Información del sistema"}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                }
                                {
                                    currentPage < totalPages && (
                                        <div className="px-4 py-3 top-0 bg-card backdrop-blur border-border/60 text-center">
                                            <button className="cursor-pointer text-[12px] tracking-wider font-semibold text-primary" onClick={onLoadMore}>
                                                {isLoadingNotifications ? "Cargando..." : "Cargar más..."}
                                            </button>
                                        </div>
                                    )
                                }
                            </section>
                        )
                    }
                </section>
            </section>
        </>
    )
}
