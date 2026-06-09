import type { AcademicCycleGroupSchoolSubjectCalendar } from "@/interfaces/entites/academic-cycle-group-school-subject-calendar";
import { hhmmToMinutes } from "../lib/schedule-calendar";

interface Props {
  calendars: AcademicCycleGroupSchoolSubjectCalendar[];
}

export const ScheduleCalendarStats = ({ calendars }: Props) => {
  return (
    <>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {calendars.length} bloque(s) programado(s) en la semana
        </span>
        <span className="font-mono">
          Horas semanales:{" "}
          <span className="font-semibold text-foreground">
            {
              Math.round(
                calendars.reduce((acc: any, c: any) => acc + (hhmmToMinutes(c.endTime) - hhmmToMinutes(c.startTime)), 0) / 60 * 10,
              ) / 10
            }{" "}h
          </span>
        </span>
      </div>
    </>
  )
}
