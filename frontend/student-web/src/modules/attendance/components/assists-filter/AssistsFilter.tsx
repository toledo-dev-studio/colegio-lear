import { useSearchParams } from "react-router";
import { CalendarRange, RotateCcw, Search } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";
import { Controller, useForm } from "react-hook-form";
import { getCurrentWeekRange } from "../../lib/attendance.lib";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import type { StudentAssistFilter } from "@/interfaces/filter/student-assist.filter";

export const AssistsFilter = () => {
    // Component hooks & stores
    const defaultRange = getCurrentWeekRange();
    const [searchParams, setSearchParams] = useSearchParams();

    const studentAssistFilterLike: Partial<StudentAssistFilter> = {
        fromDate: isValidValueWithDefault(searchParams.get("from-date"), defaultRange.from),
        toDate: isValidValueWithDefault(searchParams.get("to-date"), defaultRange.to),
    };

    // Use react hook form configuration
    const { control, handleSubmit, reset } = useForm<Partial<StudentAssistFilter>>({
        defaultValues: studentAssistFilterLike
    });

    const handleClickClearFilters = () => {
        searchParams.set("from-date", defaultRange.from);
        searchParams.set("to-date", defaultRange.to);
        reset({
            fromDate: defaultRange.from,
            toDate: defaultRange.to,
        });
        setSearchParams(searchParams);
    }

    const onSubmit = (filter: Partial<StudentAssistFilter>) => {
        filter.fromDate ? searchParams.set("from-date", filter.fromDate) : searchParams.delete("from-date");
        filter.toDate ? searchParams.set("to-date", filter.toDate) : searchParams.delete("to-date");
        setSearchParams(searchParams);
    }

    return (
        <>
            <form className="flex flex-col gap-y-4" onSubmit={handleSubmit(onSubmit)}>

                <div className="flex flex-col lg:flex-row lg:items-end gap-x-4 gap-y-3">

                    <div className="control-container">
                        <label className="label">Fecha inicio:</label>
                        <Controller
                            name="fromDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    placeholder="Selecciona la fecha de inicio"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Fecha fin:</label>
                        <Controller
                            name="toDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    placeholder="Selecciona la fecha de fin"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-2 border-box">
                        <Button type="submit">
                            <Search className="w-4 h-4" />
                            Aplicar
                        </Button>
                        <Button variant="outline" type="button" onClick={handleClickClearFilters}>
                            <RotateCcw className="w-4 h-4" />
                            Limpiar
                        </Button>
                    </div>

                </div>

                <p className="flex items-center gap-x-2 text-xs text-muted-foreground">
                    <CalendarRange className="w-3.5 h-3.5" />
                    Por defecto se muestra el registro de la semana en curso.
                </p>

            </form>
        </>
    )
}
