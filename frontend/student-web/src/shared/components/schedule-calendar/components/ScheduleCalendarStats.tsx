import type { Calendar } from "../types/calendar";
import { hhmmToMinutes } from "../lib/schedule-calendar";

interface Props {
  calendars: Calendar[]
}

export const ScheduleCalendarStats = ({ calendars }: Props) => {
  const validCalendars = calendars.filter((c) => c?.startTime && c?.endTime);
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
                validCalendars.reduce((acc: any, c: any) => acc + (hhmmToMinutes(c.endTime) - hhmmToMinutes(c.startTime)), 0) / 60 * 10,
              ) / 10
            }{" "}h
          </span>
        </span>
      </div>
    </>
  )
}
