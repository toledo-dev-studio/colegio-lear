import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { useLoaderStore } from "@/stores/LoaderStore";
import { promisePool } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { useGetSchoolSubjectGrades } from "../../../../hooks/school-subject-grades/useGetSchoolSubjectGrades";
import { useGetAcademicCycleEnrollmentsBySchoolGroup } from "../../../../hooks/shared/useGetAcademicCycleEnrollmentsBySchoolGroup";
import { useCreateUpdateSchoolSubjectGrade } from "../../../../hooks/school-subject-grades/useCreateUpdateSchoolSubjectGrade";
import { useDeleteSchoolSubjectGradeById } from "../../../../hooks/school-subject-grades/useDeleteSchoolSubjectGradeById";
import { averageOf, computeSubjectAverage } from "../lib/school-subject-grades";
import type { StudentSubjectGrade } from "../lib/school-subject-grades";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";

/**
 * Type: Local
 * Description: Draft grades map keyed by academic cycle enrollment id and evaluation number.
 * An empty string means the grade was cleared by the user.
 */
export type DraftGrades = Record<string, Record<number, string>>;

interface DirtyCell {
    academicCycleEnrollmentId: string;
    evaluationNumber: number;
    gradeId?: string;
    value?: number;
}

export interface SubjectGradesStats {
    subjectAverage: number;
    gradedCount: number;
    passingCount: number;
    failingCount: number;
    sinCalificarCount: number;
    best: { name: string; averageGrade: number } | null;
    worst: { name: string; averageGrade: number } | null;
    evaluationAverages: (number | undefined)[];
}

interface Options {
    academicCycleId?: string;
    academicCycleSchoolGroupId?: string;
    schoolSubjectId?: string;
    evaluationCount: number;
    minimumPassingGrade: number;
}

export const useSchoolSubjectGradesPage = ({ academicCycleId, academicCycleSchoolGroupId, schoolSubjectId, evaluationCount, minimumPassingGrade }: Options) => {
    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Components hooks & stores
    const [localGrades, setLocalGrades] = useState<StudentGradeResponse[]>([]);
    const [draft, setDraft] = useState<DraftGrades>({});
    const [hydratedSubjectId, setHydratedSubjectId] = useState<string | undefined>(undefined);
    const [hasHydratedData, setHasHydratedData] = useState(false);

    // Queries
    const getGradesQuery = useGetSchoolSubjectGrades({ academicCycleSchoolGroupId, schoolSubjectId });
    const getEnrollmentsQuery = useGetAcademicCycleEnrollmentsBySchoolGroup({ academicCycleId, academicCycleSchoolGroupId });

    // Mutations
    const createUpdateGradeMutation = useCreateUpdateSchoolSubjectGrade();
    const deleteGradeMutation = useDeleteSchoolSubjectGradeById();

    // Hydrate local grades when the school subject changes or when query data first arrives (adjusting state during render)
    const queryData = getGradesQuery.data;
    if (schoolSubjectId !== hydratedSubjectId) {
        setHydratedSubjectId(schoolSubjectId);
        setHasHydratedData(false);
        setLocalGrades([]);
        setDraft({});
    } else if (queryData && !hasHydratedData) {
        setHasHydratedData(true);
        setLocalGrades(queryData);
    }

    // Fetched map: enrollment id -> evaluation number -> grade record
    const fetchedMap = useMemo(() => {
        const map: Record<string, Record<number, StudentGradeResponse>> = {};
        for (const grade of localGrades) {
            map[grade.academicCycleEnrollmentId] ??= {};
            map[grade.academicCycleEnrollmentId][grade.evaluationNumber] = grade;
        }
        return map;
    }, [localGrades]);

    // Effective values: draft overrides fetched grades
    const effectiveGrades = useMemo(() => {
        const map: Record<string, Record<number, number>> = {};
        for (const [enrollmentId, byEvaluation] of Object.entries(fetchedMap)) {
            map[enrollmentId] ??= {};
            for (const [evaluation, grade] of Object.entries(byEvaluation))
                map[enrollmentId][Number(evaluation)] = grade.grade;
        }
        for (const [enrollmentId, byEvaluation] of Object.entries(draft)) {
            map[enrollmentId] ??= {};
            for (const [evaluation, value] of Object.entries(byEvaluation)) {
                if (value !== "")
                    map[enrollmentId][Number(evaluation)] = Number(value);
                else
                    delete map[enrollmentId][Number(evaluation)];
            }
        }
        return map;
    }, [draft, fetchedMap]);

    // Roster of the school group
    const enrollments = useMemo(() => getEnrollmentsQuery.data ?? [], [getEnrollmentsQuery.data]);

    // Per student summary computed from effective values
    const studentGrades = useMemo<StudentSubjectGrade[]>(() => {
        return enrollments.map((enrollment) => {
            const byEvaluation = effectiveGrades[enrollment.id] ?? {};
            return {
                academicCycleEnrollmentId: enrollment.id,
                gradesByEvaluation: byEvaluation,
                gradeCount: Object.keys(byEvaluation).length,
                averageGrade: averageOf(Object.values(byEvaluation)),
            };
        });
    }, [enrollments, effectiveGrades]);

    const studentNameOf = useCallback((enrollmentId: string): string => {
        const enrollment = enrollments.find((item) => item.id === enrollmentId);
        if (!enrollment?.student)
            return "Alumno";
        return `${enrollment.student.name} ${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim();
    }, [enrollments]);

    // Subject stats computed from effective values
    const stats = useMemo<SubjectGradesStats>(() => {
        const graded = studentGrades.filter((student) => student.gradeCount > 0);

        const subjectAverage = computeSubjectAverage(graded);
        const failingCount = graded.filter((student) => student.averageGrade < minimumPassingGrade).length;

        const best = graded.length
            ? graded.reduce((a, b) => (a.averageGrade >= b.averageGrade ? a : b))
            : null;
        const worst = graded.length
            ? graded.reduce((a, b) => (a.averageGrade <= b.averageGrade ? a : b))
            : null;

        const evaluationAverages = Array.from({ length: evaluationCount }, (_, index) => {
            const values = graded
                .map((student) => student.gradesByEvaluation[index + 1])
                .filter((value): value is number => value !== undefined);
            return values.length > 0 ? averageOf(values) : undefined;
        });

        return {
            subjectAverage,
            gradedCount: graded.length,
            passingCount: graded.length - failingCount,
            failingCount,
            sinCalificarCount: enrollments.length - graded.length,
            best: best ? { name: studentNameOf(best.academicCycleEnrollmentId), averageGrade: best.averageGrade } : null,
            worst: worst ? { name: studentNameOf(worst.academicCycleEnrollmentId), averageGrade: worst.averageGrade } : null,
            evaluationAverages,
        };
    }, [studentGrades, enrollments.length, minimumPassingGrade, evaluationCount, studentNameOf]);

    // Dirty cells to save (upsert when value changed, delete when a fetched grade was cleared)
    const dirtyCells = useMemo<DirtyCell[]>(() => {
        const cells: DirtyCell[] = [];
        for (const [enrollmentId, byEvaluation] of Object.entries(draft)) {
            for (const [evaluation, value] of Object.entries(byEvaluation)) {
                const evaluationNumber = Number(evaluation);
                const fetched = fetchedMap[enrollmentId]?.[evaluationNumber];
                if (value === "") {
                    if (fetched)
                        cells.push({ academicCycleEnrollmentId: enrollmentId, evaluationNumber, gradeId: fetched.id, value: undefined });
                } else {
                    const numeric = Number(value);
                    if (!fetched || numeric !== fetched.grade)
                        cells.push({ academicCycleEnrollmentId: enrollmentId, evaluationNumber, gradeId: fetched?.id, value: numeric });
                }
            }
        }
        return cells;
    }, [draft, fetchedMap]);

    // Component functions
    const handleChangeGrade = useCallback((enrollmentId: string, evaluationNumber: number, value: string) => {
        // Only allow empty or a valid grade (0-10 with up to 1 decimal)
        if (value !== "" && !/^\d{0,2}(\.\d?)?$/.test(value))
            return;
        if (value !== "" && Number(value) > 10)
            return;

        setDraft((prev) => ({
            ...prev,
            [enrollmentId]: {
                ...prev[enrollmentId],
                [evaluationNumber]: value,
            },
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (dirtyCells.length === 0)
            return;

        showLoading("Guardando calificaciones...");
        let failedCount = 0;

        try {
            // Process cells in parallel in pool of 3 requests; each finishes independently
            await promisePool(dirtyCells, 3, async (cell) => {
                try {
                    if (cell.value === undefined) {
                        await deleteGradeMutation.mutateAsync({
                            id: cell.gradeId!,
                            academicCycleSchoolGroupId: academicCycleSchoolGroupId!,
                            schoolSubjectId: schoolSubjectId!,
                        });
                    } else {
                        await createUpdateGradeMutation.mutateAsync({
                            academicCycleSchoolGroupId: academicCycleSchoolGroupId!,
                            schoolSubjectId: schoolSubjectId!,
                            academicCycleEnrollmentId: cell.academicCycleEnrollmentId,
                            evaluationNumber: cell.evaluationNumber,
                            grade: cell.value,
                        });
                    }
                } catch (error) {
                    console.warn(error);
                    failedCount++;
                }
            });

            // Apply changes locally so the session keeps the updated grades
            const next = [...localGrades];
            for (const cell of dirtyCells) {
                const index = next.findIndex((grade) =>
                    grade.academicCycleEnrollmentId === cell.academicCycleEnrollmentId &&
                    grade.evaluationNumber === cell.evaluationNumber
                );
                if (index >= 0)
                    next.splice(index, 1);
                if (cell.value !== undefined)
                    next.push({
                        id: generateTemporalId(),
                        grade: cell.value,
                        evaluationNumber: cell.evaluationNumber,
                        schoolSubjectId: schoolSubjectId!,
                        academicCycleEnrollmentId: cell.academicCycleEnrollmentId,
                    });
            }
            setLocalGrades(next);
            setDraft({});
            hideLoading();

            if (failedCount > 0)
                toast.error(`Se guardaron ${dirtyCells.length - failedCount} de ${dirtyCells.length} calificaciones.`, { position: "top-right" });
            else
                toast.success("Calificaciones guardadas correctamente", { position: "top-right" });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error("Ocurrió un error al tratar de guardar las calificaciones", { position: "top-right" });
        }
    }, [dirtyCells, localGrades, academicCycleSchoolGroupId, schoolSubjectId, createUpdateGradeMutation, deleteGradeMutation, showLoading, hideLoading]);

    return {
        enrollments,
        studentGrades,
        draft,
        dirtyCount: dirtyCells.length,
        isLoading: getGradesQuery.isLoading || getEnrollmentsQuery.isLoading,
        isError: getGradesQuery.isError || getEnrollmentsQuery.isError,
        stats,
        handleChangeGrade,
        handleSubmit,
    };
}

export type SchoolSubjectGradesPageReturn = ReturnType<typeof useSchoolSubjectGradesPage>;