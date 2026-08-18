import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AssistStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { toISODay, toDayParam } from "../../../../lib/attendance.lib";
import type { StudentAssistResponse } from "@/interfaces/responses/student-assist.response";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getPagedAcademicCycleEnrollmentsAsync } from "@/modules/academic-cycles/api/academic-cycle-enrollments/get-paged-academic-cycle-enrollments.api";
import { useGetSchoolGroupAssists } from "../../../../hooks/useGetSchoolGroupAssists";
import { useCreateUpdateSchoolGroupAssists } from "../../../../hooks/useCreateUpdateSchoolGroupAssists";
import { useAttendanceTabTable } from "./useAttendanceTabTable";
import { useLoaderStore } from "@/stores/LoaderStore";

export interface AttendanceRecord {
    status: AssistStatusKey;
    absenceReason: string;
}

const DEFAULT_RECORD: AttendanceRecord = {
    status: "present",
    absenceReason: "",
};

const PAGE_SIZE = 1000;

interface Options {
    academicCycleId?: string;
    schoolGroupId?: string;
    academicCycle?: AcademicCycleResponse;
    loggedInUserCanWrite: boolean;
}

export const useAttendanceTab = ({ academicCycleId, schoolGroupId, academicCycle, loggedInUserCanWrite }: Options) => {
    // Main hooks and stores
    const { showLoading, hideLoading } = useLoaderStore();
    
    // Selected date, defaulted to today when it is inside the cycle range
    const [assistDate, setAssistDate] = useState<string>(() => {
        const today = new Date();
        const start = academicCycle?.startDate ? new Date(academicCycle.startDate) : undefined;
        const end = academicCycle?.endDate ? new Date(academicCycle.endDate) : undefined;
        if (start && today < start) return toISODay(start);
        if (end && today > end) return toISODay(end);
        return toISODay(today);
    });

    // All the enrollments of the school group, reusing the academic cycles API with a forced group filter
    const enrollmentsQuery = useQuery({
        queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, {
            academicCycleId,
            academicCycleSchoolGroupId: schoolGroupId,
        }],
        queryFn: () => getPagedAcademicCycleEnrollmentsAsync({
            page: 1,
            pageSize: PAGE_SIZE,
            academicCycleId: academicCycleId!,
            academicCycleSchoolGroupId: schoolGroupId!,
        }),
        enabled: (!!academicCycleId && !!schoolGroupId),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });

    // Assists already registered for the selected date
    const assistsQuery = useGetSchoolGroupAssists({ academicCycleId, schoolGroupId, assistDate });

    // Attendance records per enrollment with a snapshot of the last saved state
    const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
    const [savedSnapshot, setSavedSnapshot] = useState<Record<string, AttendanceRecord>>({});
    const [hydratedKey, setHydratedKey] = useState<string>("");

    // Initialize records whenever the selected date changes,
    // adjusting state during render (react.dev/learn/you-might-not-need-an-effect)
    const currentKey = assistDate;
    if (hydratedKey !== currentKey && enrollmentsQuery.data && assistsQuery.data) {
        const next: Record<string, AttendanceRecord> = {};
        for (const enrollment of enrollmentsQuery.data.data) {
            const saved = assistsQuery.data.find((assist: StudentAssistResponse) => assist.academicCycleEnrollmentId === enrollment.id);
            next[enrollment.id] = {
                status: saved?.status ?? DEFAULT_RECORD.status,
                absenceReason: saved?.absenceReason ?? DEFAULT_RECORD.absenceReason,
            };
        }
        setHydratedKey(currentKey);
        setRecords(next);
        setSavedSnapshot(next);
    }

    // Component functions
    const handleStatusChange = (enrollmentId: string, status: AssistStatusKey) => {
        if (!loggedInUserCanWrite) return;
        setRecords((prev) => ({
            ...prev,
            [enrollmentId]: {
                ...(prev[enrollmentId] ?? DEFAULT_RECORD),
                status,
            },
        }));
    }

    const handleReasonChange = (enrollmentId: string, absenceReason: string) => {
        if (!loggedInUserCanWrite) return;
        setRecords((prev) => ({
            ...prev,
            [enrollmentId]: {
                ...(prev[enrollmentId] ?? DEFAULT_RECORD),
                absenceReason,
            },
        }));
    }

    const createUpdateAssistsMutation = useCreateUpdateSchoolGroupAssists();

    const handleSave = async () => {
        showLoading("Guardando asistencia...");

        const assists = Object.entries(records).map(([academicCycleEnrollmentId, record]) => ({
            academicCycleEnrollmentId,
            status: record.status,
            absenceReason: record.status === "absent" && record.absenceReason.trim() ? record.absenceReason.trim() : null,
        }));

        await createUpdateAssistsMutation.mutateAsync({
            academicCycleId: academicCycleId!,
            schoolGroupId: schoolGroupId!,
            assistDate,
            assists,
        }, {
            onSuccess: () => {
                setSavedSnapshot({ ...records });
                hideLoading();
                toast.success("Asistencias guardadas correctamente", { position: "top-right" });
            },
            onError: () => {
                hideLoading();
                toast.success("Ocurrio un error al tratar de guardar las asistencias", { position: "top-right" });
            }
        });

    }

    const table = useAttendanceTabTable({
        records,
        savedSnapshot,
        loggedInUserCanWrite,
        onStatusChange: handleStatusChange,
        onReasonChange: handleReasonChange,
    });

    return {
        assistDate,
        setAssistDate: (value?: string) => setAssistDate(toDayParam(value) ?? ""),
        enrollments: enrollmentsQuery.data?.data ?? [],
        isLoading: enrollmentsQuery.isLoading || assistsQuery.isLoading,
        isError: enrollmentsQuery.isError || assistsQuery.isError,
        handleSave,
        isSaving: createUpdateAssistsMutation.isPending,
        isDisabled: !loggedInUserCanWrite,
        table,
    };
}

export type AttendanceTabReturn = ReturnType<typeof useAttendanceTab>;