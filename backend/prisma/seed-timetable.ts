// Pure (no Prisma) weekly timetable definition for the seed. The compact grids
// below are expanded by buildTimetable(); recess is a gap between periods
// because a calendar row requires a subject and a teacher.

export type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
export type GroupKey = "primaria_a" | "primaria_b" | "preescolar_a" | "preescolar_b";

export const DAYS: readonly Day[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
export const GROUP_KEYS: readonly GroupKey[] = [
  "primaria_a",
  "primaria_b",
  "preescolar_a",
  "preescolar_b",
];

export type TimetableSlot = {
  groupKey: GroupKey;
  day: Day;
  period: number;
  subjectKey: string;
  start: string;
  end: string;
};

type Period = { start: string; end: string };

// Primaria: 5 x 1h per day, recess 11:00-11:30 (gap).
export const PRIMARIA_PERIODS: readonly Period[] = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:30", end: "12:30" },
  { start: "12:30", end: "13:30" },
];

// Preescolar: 4 x 1h per day, recess 10:00-10:30 (gap).
export const PREESCOLAR_PERIODS: readonly Period[] = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:30", end: "11:30" },
  { start: "11:30", end: "12:30" },
];

export const PRIMARIA_DAILY_FIRST = "espanol_1p";
export const PREESCOLAR_DAILY_FIRST = "espanol_1pe";

// Group A, periods 2..last. Group B is this grid rotated left by one per day.
export const PRIMARIA_GRID_A: Record<Day, readonly string[]> = {
  monday: ["matematicas_1p", "ciencias_1p", "ingles_1p", "educacion_fisica_1p"],
  tuesday: ["matematicas_1p", "historia_1p", "educacion_artistica_1p", "computacion_1p"],
  wednesday: ["matematicas_1p", "ingles_1p", "ciencias_1p", "formacion_civica_1p"],
  thursday: ["matematicas_1p", "educacion_artistica_1p", "computacion_1p", "historia_1p"],
  friday: ["ciencias_1p", "ingles_1p", "educacion_fisica_1p", "geografia_1p"],
};

export const PREESCOLAR_GRID_A: Record<Day, readonly string[]> = {
  monday: ["matematicas_1pe", "exploracion_1pe", "musica_1pe"],
  tuesday: ["ingles_1pe", "psicomotricidad_1pe", "expresion_1pe"],
  wednesday: ["matematicas_1pe", "convivencia_1pe", "exploracion_1pe"],
  thursday: ["expresion_1pe", "ingles_1pe", "psicomotricidad_1pe"],
  friday: ["matematicas_1pe", "musica_1pe", "convivencia_1pe"],
};

export function rotateLeft<T>(items: readonly T[]): T[] {
  return [...items.slice(1), ...items.slice(0, 1)];
}

export function buildTimetable(): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  for (const groupKey of GROUP_KEYS) {
    const isPrimaria = groupKey.startsWith("primaria");
    const periods = isPrimaria ? PRIMARIA_PERIODS : PREESCOLAR_PERIODS;
    const first = isPrimaria ? PRIMARIA_DAILY_FIRST : PREESCOLAR_DAILY_FIRST;
    const gridA = isPrimaria ? PRIMARIA_GRID_A : PREESCOLAR_GRID_A;
    for (const day of DAYS) {
      const rest = groupKey.endsWith("_a") ? gridA[day] : rotateLeft(gridA[day]);
      const subjects = [first, ...rest];
      periods.forEach((p, i) => {
        slots.push({
          groupKey,
          day,
          period: i + 1,
          subjectKey: subjects[i]!,
          start: p.start,
          end: p.end,
        });
      });
    }
  }
  return slots;
}

/** Throws on start >= end, group overlap or teacher overlap (same day). */
export function assertNoConflicts(
  slots: readonly TimetableSlot[],
  teacherOf: (subjectKey: string, groupKey: GroupKey) => string,
): void {
  for (const s of slots) {
    if (s.start >= s.end) throw new Error(`Invalid time range: ${s.groupKey} ${s.day} ${s.start}`);
  }
  const overlaps = (a: TimetableSlot, b: TimetableSlot) =>
    a.day === b.day && a.start < b.end && b.start < a.end;
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i]!;
      const b = slots[j]!;
      if (!overlaps(a, b)) continue;
      if (a.groupKey === b.groupKey) {
        throw new Error(`Group overlap: ${a.groupKey} ${a.day} ${a.start}`);
      }
      if (teacherOf(a.subjectKey, a.groupKey) === teacherOf(b.subjectKey, b.groupKey)) {
        throw new Error(`Teacher overlap: ${a.subjectKey}/${b.subjectKey} ${a.day} ${a.start}`);
      }
    }
  }
}

export function calendarId(n: number): string {
  return `ee000000-0021-4000-8000-${String(n).padStart(12, "0")}`;
}

/** Fixed ids of the previous (sparse) schedule, seq 1..32. */
export const LEGACY_CALENDAR_IDS: string[] = Array.from(
  { length: 32 },
  (_, i) => `ee000000-0011-4000-8000-${String(i + 1).padStart(12, "0")}`,
);
