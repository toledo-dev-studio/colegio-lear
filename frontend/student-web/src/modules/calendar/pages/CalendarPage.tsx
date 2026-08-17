import { useMemo } from "react";
import { CalendarRange } from "lucide-react";

import { useCalendarPage } from "../hooks/useCalendarPage";
import { CardHeader } from "@/shared/components/card-header/CardHeader";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import { CalendarSkeleton } from "../components/calendar-skeleton/CalendarSkeleton";
import ScheduleCalendar from "@/shared/components/schedule-calendar/ScheduleCalendar";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

export const CalendarPage = () => {
  const { context, queries } = useCalendarPage();
  const calendars = queries.calendarsQuery.data ?? [];

  const teachers = useMemo<EmployeeResponse[]>(
    () => calendars
      .map((item) => item.teacher)
      .filter((teacher): teacher is EmployeeResponse => !!teacher)
      .filter((teacher, index, array) => array.findIndex((t) => t.id === teacher.id) === index),
    [calendars],
  );

  const schoolSubjects = useMemo<SchoolSubjectResponse[]>(
    () => calendars
      .map((item) => item.schoolSubject)
      .filter((subject): subject is SchoolSubjectResponse => !!subject)
      .filter((subject, index, array) => array.findIndex((s) => s.id === subject.id) === index),
    [calendars],
  );

  return (
    <>
      <section className="page-main-section">

        {/* Page title */}
        <ModulePageTitle
          icon={CalendarRange}
          badge="Horario escolar"
          title="Horario escolar, "
          description="Consulta el horario semanal de tu grupo escolar, con la materia, el horario y el docente a cargo de cada clase."
          studentName={context.student?.fullName}
          cycle={context.academicCycle}
        />

        {/* Schedule calendar */}
        <section className="card">
          <CardHeader
            icon={CalendarRange}
            title="Horario escolar"
            description="Consulta el horario semanal de tu grupo escolar, con la materia, el horario y el docente a cargo de cada clase."
            tone="primary"
          />

          {queries.calendarsQuery.isLoading ? (
            <CalendarSkeleton />
          ) : (
            <ScheduleCalendar
              disabled
              teachers={teachers}
              schoolSubjects={schoolSubjects}
              calendars={calendars} />
          )}

        </section>

      </section>
    </>
  )
}