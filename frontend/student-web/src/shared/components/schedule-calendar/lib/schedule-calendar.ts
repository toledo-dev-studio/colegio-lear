import { DAY_END_MIN, DAY_START_MIN, SLOT_MIN } from "./schedule-calendar-consts";

const pad2 = (n: number) => String(n).padStart(2, "0");

export const minutesToHHMM = (m: number) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
export const hhmmToMinutes = (s?: string): number => {
    if (!s) return 0;
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
};
export const snap = (m: number) => Math.round(m / SLOT_MIN) * SLOT_MIN;
export const clampMin = (m: number) => Math.max(DAY_START_MIN, Math.min(DAY_END_MIN, m));