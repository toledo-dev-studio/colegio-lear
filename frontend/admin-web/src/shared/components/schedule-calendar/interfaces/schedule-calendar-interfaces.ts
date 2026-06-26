import type { Calendar } from "../types/calendar";
import type { DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair";

export type DragMode = "create" | "move" | "resize";

export interface DragState {
    mode: DragMode;
    day: DayOfWeekKey;
    startMin: number;
    endMin: number;
    originalStart?: number;
    originalEnd?: number;
    originalDay?: DayOfWeekKey;
    pointerStartY: number;
    pointerStartX: number;
    calendar?: Calendar;
}
