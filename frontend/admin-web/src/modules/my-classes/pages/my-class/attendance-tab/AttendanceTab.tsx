import { Save } from "lucide-react";
import { useOutletContext } from "react-router";

import { Button } from "@/shared/shadcn/ui/button";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useAttendanceTab } from "./hooks/useAttendanceTab";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import type { MyClassLayoutContext } from "../../../interfaces/my-class-layout-context";
import { StudentAttendanceTable } from "./components/StudentAttendanceTable";

export const AttendanceTab = () => {
    // Component hooks & stores
    const { myClassId, academicCycleId, academicCycle, loggedInUserCanWrite } = useOutletContext<MyClassLayoutContext>();

    const {
        assistDate,
        setAssistDate,
        enrollments,
        isLoading,
        isError,
        handleSave,
        isSaving,
        isDisabled,
        table,
    } = useAttendanceTab({
        academicCycleId,
        schoolGroupId: myClassId,
        academicCycle,
        loggedInUserCanWrite,
    });

    return (
        <section className="flex flex-col gap-y-6">

            {/* Section title */}
            <SectionTitle
                title="LISTADO DE ESTUDIANTES INSCRITOS AL CICLO ESCOLAR"
                description="El siguiente listado contiene la información de los estudiantes inscritos al ciclo escolar del grupo seleccionado, junto con el registro de asistencias para la fecha indicada." />

            {/* Date filter and save actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Fecha de asistencia</label>
                    <DatePicker
                        placeholder="Selecciona una fecha"
                        value={`${assistDate}T12:00:00.000Z`}
                        minDate={academicCycle?.startDate}
                        maxDate={academicCycle?.endDate}
                        onChange={setAssistDate} />
                    <p className="text-xs text-muted-foreground">
                        Rango válido: {formatFriendlyDate(academicCycle?.startDate ?? "")} – {formatFriendlyDate(academicCycle?.endDate ?? "")}
                    </p>
                </div>

                <Button disabled={isDisabled || isSaving} onClick={handleSave}>
                    <Save aria-hidden="true" />
                    Guardar asistencias
                </Button>
            </div>

            {/* Registered students table */}
            <StudentAttendanceTable
                data={enrollments}
                isLoading={isLoading}
                isError={isError}
                columns={table.columns}
                properties={table.properties} />
        </section>
    )
}

export default AttendanceTab;