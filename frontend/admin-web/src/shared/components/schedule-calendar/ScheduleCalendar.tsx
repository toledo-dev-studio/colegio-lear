import React, { useRef, useState, useCallback, useEffect } from "react";
import { Info, Trash } from "lucide-react";

import { Modal } from "../modal/Modal";
import type { Calendar } from "./types/calendar";
import { generateTemporalId } from "@/lib/extensions/utils";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import { CalendarTimeGuide } from "./components/CalendarTimeGuide";
import { CalendarFormPanel } from "./components/CalendarFormPanel";
import { colorOf } from "./lib/schedule-calendar-palette-subject-colors";
import { ScheduleCalendarStats } from "./components/ScheduleCalendarStats";
import type { DragState } from "./interfaces/schedule-calendar-interfaces";
import { CalendarWeekDaysHeader } from "./components/CalendarWeekDaysHeader";
import { DAY_OF_WEEKS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { type DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import { minutesToHHMM, clampMin, hhmmToMinutes, snap } from "./lib/schedule-calendar";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { DAY_END_MIN, DAY_START_MIN, MIN_BLOCK_MIN, SLOT_MIN, SLOT_PX, TOTAL_SLOTS } from "./lib/schedule-calendar-consts";

interface Props {
    disabled: boolean;
    calendars: Calendar[];
    teachers: EmployeeResponse[];
    schoolSubjects: SchoolSubjectResponse[];
    onChangeCalendars?: (calendars: Calendar[]) => void;
}

export default function ScheduleCalendar({ disabled = false, teachers = [], schoolSubjects = [], calendars = [], onChangeCalendars = () => {} }: Props) {

    const calendarGridRef = useRef<HTMLDivElement>(null);

    const [drag, setDrag] = useState<DragState | null>(null);
    const [calendar, setCalendar] = useState<Calendar>();
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<Calendar>();

    const yToMinutes = (clientY: number, columnEl: HTMLElement): number => {
        const rect = columnEl.getBoundingClientRect();
        const offset = clientY - rect.top;
        const raw = DAY_START_MIN + (offset / SLOT_PX) * SLOT_MIN;
        return clampMin(snap(raw));
    };

    const onPointerDownCreate = (e: React.PointerEvent, day: DayOfWeekKey) => {
        if (disabled) return;

        if ((e.target as HTMLElement).closest("[data-block]")) return; // ignore on blocks

        e.preventDefault();
        const col = e.currentTarget as HTMLElement;
        col.setPointerCapture(e.pointerId);
        const startMin = yToMinutes(e.clientY, col);
        setDrag({
            mode: "create",
            day,
            startMin,
            endMin: startMin + SLOT_MIN,
            pointerStartY: e.clientY,
            pointerStartX: e.clientX,
        });
    };

    const onPointerDownMove = (e: React.PointerEvent, calendar: Calendar, day: DayOfWeekKey, startMin: number, endMin: number) => {
        if (disabled) return;

        e.stopPropagation();
        e.preventDefault();
        const col = e.currentTarget.parentElement as HTMLElement;
        col?.setPointerCapture(e.pointerId);
        setDrag({
            mode: "move",
            day,
            startMin,
            endMin,
            calendar,
            originalStart: startMin,
            originalEnd: endMin,
            originalDay: day,
            pointerStartY: e.clientY,
            pointerStartX: e.clientX,
        });
    };

    const onPointerDownResize = (e: React.PointerEvent, calendar: Calendar, day: DayOfWeekKey, startMin: number, endMin: number) => {
        if (disabled) return;

        e.stopPropagation();
        e.preventDefault();
        const col = e.currentTarget.parentElement?.parentElement as HTMLElement;
        col?.setPointerCapture(e.pointerId);
        setDrag({
            mode: "resize",
            day,
            startMin,
            endMin,
            calendar,
            originalStart: startMin,
            originalEnd: endMin,
            originalDay: day,
            pointerStartY: e.clientY,
            pointerStartX: e.clientX,
        });
    };

    const commitDrag = useCallback(async () => {
        if (disabled) return;

        if (!drag) return;
        const d = drag;
        setDrag(null);

        if (d.mode === "create") {
            // Set temporal ID to prevent double records and manage new records
            const newCalendar = {
                id: generateTemporalId(),
                day: d.day,
                startTime: minutesToHHMM(d.startMin),
                endTime: minutesToHHMM(d.endMin),
            }
            setCalendar(newCalendar);
            return;
        }
        if (d.calendar) {
            const changed = d.startMin !== d.originalStart || d.endMin !== d.originalEnd || d.day !== d.originalDay;
            if (!changed) return;
            try {
                // On update when a card from calendar is moved with cursor
                onChangeCalendars([
                    ...calendars.filter(x => x.id !== d.calendar?.id),
                    {
                        ...d.calendar,
                        day: d.day,
                        startTime: minutesToHHMM(d.startMin),
                        endTime: minutesToHHMM(d.endMin)
                    } as Calendar
                ]);
            } catch { }
        }
    }, [drag]);

    const onPointerMove = useCallback(
        (e: PointerEvent) => {
            if (disabled) return;

            if (!drag) return;
            const grid = calendarGridRef.current;
            if (!grid) return;

            // Determine current day column from x position
            const colWidth = (grid.clientWidth - 64) / 7; // 64px for time guide
            const relativeX = e.clientX - grid.getBoundingClientRect().left - 64;
            const colIdx = Math.max(0, Math.min(6, Math.floor(relativeX / colWidth)));
            const newDay = DAY_OF_WEEKS[colIdx].key;

            const col = grid.querySelectorAll<HTMLElement>("[data-day-col]")[colIdx];
            if (!col) return;
            const currentMin = yToMinutes(e.clientY, col);

            setDrag((prev) => {
                if (!prev) return prev;
                if (prev.mode === "create") {
                    const newStart = Math.min(prev.startMin, currentMin);
                    const newEnd = Math.max(prev.startMin + SLOT_MIN, currentMin);
                    return { ...prev, day: newDay, endMin: clampMin(newEnd), startMin: clampMin(newStart) };
                }
                if (prev.mode === "move") {
                    const dur = (prev.originalEnd! - prev.originalStart!);
                    const deltaY = e.clientY - prev.pointerStartY;
                    const deltaMin = snap((deltaY / SLOT_PX) * SLOT_MIN);
                    const newStart = clampMin(prev.originalStart! + deltaMin);
                    const newEnd = clampMin(newStart + dur);
                    // If end overflows day, push start back
                    const adjEnd = newEnd > DAY_END_MIN ? DAY_END_MIN : newEnd;
                    const adjStart = adjEnd - dur < DAY_START_MIN ? DAY_START_MIN : adjEnd - dur;
                    return { ...prev, day: newDay, startMin: adjStart, endMin: adjEnd };
                }
                if (prev.mode === "resize") {
                    const newEnd = Math.max(prev.originalStart! + MIN_BLOCK_MIN, clampMin(currentMin));
                    return { ...prev, endMin: newEnd };
                }
                return prev;
            });
        },
        [drag],
    );

    const handleCreateUpdateConfirm = async (calendarLike: Partial<Calendar>) => {
        if (disabled) return;

        if (!calendar)
            return;
        try {
            // On create or update when a calendar is updated from calendarFormPanel
            onChangeCalendars([
                ...calendars.filter(x => x.id !== calendarLike.id),
                { ...calendarLike } as Calendar
            ]);
            setCalendar(undefined);
        } catch { }
    };

    const handleClickConfirmDelete = async () => {
        if (disabled) return;

        if (!recordToDelete)
            return;
        onChangeCalendars([
            ...calendars.filter(x => x.id !== recordToDelete.id),
        ]);
        closeDeleteModal();
    }

    useEffect(() => {
        if (disabled) return;

        if (!drag) return;
        const onMove = (e: PointerEvent) => onPointerMove(e);
        const onUp = () => commitDrag();
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    }, [drag, onPointerMove, commitDrag]);

    return (
        <div className="space-y-4" data-testid="dyn-schedule">

            {/* Weekly grid */}
            <div ref={calendarGridRef} className="bg-card border border-border rounded-2xl overflow-x-auto select-none">

                <CalendarWeekDaysHeader />

                {/* Body: time guide + 7 day columns */}
                <div className="flex" style={{ height: TOTAL_SLOTS * SLOT_PX }}>
                    {/* Time guide */}
                    <CalendarTimeGuide />

                    {/* Day columns | Calendar grid */}
                    {
                        DAY_OF_WEEKS.map((d) => {
                            const calendarItems = calendars.filter((c) => c.day === d.key);
                            const dragPreview = drag && drag.day === d.key ? drag : null;
                            return (
                                <div key={d.key} data-day-col={d.key} onPointerDown={(e) => onPointerDownCreate(e, d.key)} data-testid={`dyn-day-col-${d.key}`} className="min-w-40 relative flex-1 border-l border-border cursor-pointer" style={{ height: TOTAL_SLOTS * SLOT_PX }}>
                                    {/* Available slot lines */}
                                    {
                                        Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
                                            const m = DAY_START_MIN + i * SLOT_MIN;
                                            const onHour = m % 60 === 0;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`${onHour ? "border-t border-border" : "border-t border-dashed border-border/40"}`}
                                                    style={{ height: SLOT_PX }}
                                                />
                                            );
                                        })
                                    }

                                    {/* existing slots */}
                                    {
                                        calendarItems.map((item) => {
                                            
                                            const isDragging = drag?.calendar === item;
                                            // Moved to a different column; render at new column instead
                                            if (isDragging && drag?.day !== d.key)
                                                return null;

                                            const startMin = isDragging && drag ? drag.startMin : hhmmToMinutes(item.startTime!);
                                            const endMin = isDragging && drag ? drag.endMin : hhmmToMinutes(item.endTime!);
                                            const top = ((startMin - DAY_START_MIN) / SLOT_MIN) * SLOT_PX;
                                            const height = ((endMin - startMin) / SLOT_MIN) * SLOT_PX;

                                            // Get metadata
                                            const color = colorOf(item.schoolSubjectId!);
                                            const teacherFullName = `${item.teacher?.name ?? ""} ${item.teacher?.firstLastName ?? ""} ${item.teacher?.secondLastName ?? ""}`;
                                            const schoolSubjectName = item.schoolSubject?.name;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onPointerDown={(e) => onPointerDownMove(e, item, d.key, hhmmToMinutes(item.startTime!), hhmmToMinutes(item.endTime!))}
                                                    onDoubleClick={(e) => { e.stopPropagation(); setCalendar(item); }}
                                                    style={{ top: top + 2, height: height - 4 }}
                                                    className={`absolute left-1 right-1 rounded-lg border-2 ${color.bg} ${color.border} ${color.text} px-2 py-1 cursor-grab active:cursor-grabbing transition-shadow shadow-sm hover:shadow-md hover:z-20 z-10 ${isDragging ? "ring-2 ring-primary/40 shadow-lg" : ""}`}>

                                                    <section className="flex items-center justify-between gap-x-4">
                                                        {/* Class time duration */}
                                                        <div className="text-[10px] font-mono opacity-80">
                                                            {minutesToHHMM(startMin)} – {minutesToHHMM(endMin)}
                                                        </div>
                                                        {/* Actions */}
                                                        <div className="z-50 relative flex gap-x-4">
                                                            <button
                                                                type="button"
                                                                className="cursor-pointer rounded-full"
                                                                onPointerDown={(e) => e.stopPropagation()}
                                                                onClick={() => setCalendar(item)}>
                                                                <Info className="w-3 h-3" />
                                                            </button>
                                                            {
                                                                !disabled && (
                                                                    <button
                                                                        type="button"
                                                                        className="cursor-pointer rounded-full"
                                                                        onPointerDown={(e) => e.stopPropagation()}
                                                                        onClick={() => openDeleteModal(item)}>
                                                                        <Trash className="w-3 h-3" />
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    </section>

                                                    {/* Calendar item information */}
                                                    {
                                                        height >= SLOT_PX * 2 && (
                                                            <section className="relative w-full">
                                                                {/* Selected school subject */}
                                                                <div className="text-[11px] font-semibold leading-tight truncate">
                                                                    {schoolSubjectName}
                                                                </div>
                                                                {
                                                                    height >= SLOT_PX * 3 && (
                                                                        <div className="text-[10px] opacity-75 truncate">{teacherFullName}</div>
                                                                    )
                                                                }
                                                            </section>
                                                        )
                                                    }

                                                    {/* Resize handle */}
                                                    <section
                                                        onPointerDown={(e) => onPointerDownResize(e, item, d.key, hhmmToMinutes(item.startTime!), hhmmToMinutes(item.endTime!))}
                                                        data-testid={`dyn-block-resize-${item.id}`}
                                                        className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center group/handle"
                                                    >
                                                        <span className="w-8 h-1 rounded-full bg-foreground/10 group-hover/handle:bg-foreground/40 transition-colors" />
                                                    </section>
                                                </div>
                                            );
                                        })
                                    }


                                    {/* "ghost" preview while creating or while moving to a new column */}
                                    {(() => {
                                        if (dragPreview && (dragPreview.mode === "create" || (dragPreview.mode === "move" && dragPreview.originalDay !== d.key))) {
                                            const color = colorOf("temp");
                                            return (
                                                <div className={`absolute left-1 right-1 rounded-lg border-2 border-dashed ${color.border} ${color.bg} px-2 py-1 pointer-events-none flex flex-col items-center justify-center`}
                                                    style={{
                                                        top: ((dragPreview.startMin - DAY_START_MIN) / SLOT_MIN) * SLOT_PX + 2,
                                                        height: ((dragPreview.endMin - dragPreview.startMin) / SLOT_MIN) * SLOT_PX - 4,
                                                    }}>
                                                    <div className="text-[10px] font-mono opacity-80">
                                                        {minutesToHHMM(dragPreview.startMin)} – {minutesToHHMM(dragPreview.endMin)}
                                                    </div>
                                                    <div className="text-[10px] opacity-75">
                                                        {Math.round((dragPreview.endMin - dragPreview.startMin))} min
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })()}
                                </div>
                            );
                        })
                    }

                </div>
            </div >

            {/* Quick stats */}
            <ScheduleCalendarStats calendars={calendars} />

            {/* Create / update schedule calendar */}
            {
                calendar && (
                    <CalendarFormPanel
                        disabled={disabled}
                        schoolSubjects={schoolSubjects}
                        teachers={teachers}
                        calendar={calendar}
                        onCancel={() => { setCalendar(undefined) }}
                        onSubmit={handleCreateUpdateConfirm}
                    />
                )
            }

            {/* Delete single record modal */}
            {
                recordToDelete && (
                    <Modal
                        open={isOpenSingleDeleteModal}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro seleccionado?`}
                        message={"Esta acción no se podrá deshacer y deberás generar un nuevo registro en caso de necesitarlo"}
                        isLoading={false}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => closeDeleteModal()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDelete
                        }}
                    />
                )
            }
        </div>
    );
}
