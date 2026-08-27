import { useMemo } from "react";
import { useOutletContext } from "react-router";

import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import ScheduleCalendar from "@/shared/components/schedule-calendar/ScheduleCalendar";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import type { MyClassLayoutContext } from "@/modules/my-classes/interfaces/my-class-layout-context";

export const CalendarTab = () => {
    // Component hooks & stores
    const { schoolGroup } = useOutletContext<MyClassLayoutContext>();

    const calendars = schoolGroup?.calendars || [];

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
            <section className="flex flex-col gap-y-6">

                {/* Section title */}
                <SectionTitle
                    title="CALENDARIO ESCOLAR"
                    description="Consulta el calendario escolar completo del grupo seleccionado." />

                <ScheduleCalendar
                    disabled={true}
                    calendars={calendars}
                    teachers={teachers}
                    schoolSubjects={schoolSubjects}
                />

            </section>
        </>
    );
};

export default CalendarTab;