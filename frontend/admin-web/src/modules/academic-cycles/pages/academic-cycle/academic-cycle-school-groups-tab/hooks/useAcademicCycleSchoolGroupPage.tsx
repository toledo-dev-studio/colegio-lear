import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { useGetTeachersEmployees } from "@/modules/employees/hooks/employees/useGetTeachersEmployees";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetAcademicCycleSchoolSubjects } from "@/modules/academic-cycles/hooks/academic-cycle-school-subjects/useGetAcademicCycleSchoolSubjects";
import { useCreateUpdateAcademicCycleSchoolGroup } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useCreateUpdateAcademicCycleSchoolGroup";
import { useGetAcademicCycleSchoolGroupById } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useGetAcademicCycleSchoolGroupById";

interface Props {
    id: string;
}

export const useAcademicCycleSchoolGroupPage = ({ id }: Props) => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Queries
    const getAcademicCycleSchoolGroupQuery = useGetAcademicCycleSchoolGroupById({ id, academicCycleId: academicCycleId! });
    const getTeachersQuery = useGetTeachersEmployees();
    const getSchoolSubjectsQuery = useGetAcademicCycleSchoolSubjects({ academicCycleId: academicCycleId! });

    // Mutations
    const createUpdateAcademicCycleSchoolGroupMutation = useCreateUpdateAcademicCycleSchoolGroup();

    return {
        context: {
            isLocked,
            academicCycle,
            academicCycleId,
        },
        queries: {
            schoolGroups: {
                getById: getAcademicCycleSchoolGroupQuery
            },
            schoolSubjects: {
                get: {
                    ...getSchoolSubjectsQuery,
                    data: getSchoolSubjectsQuery.data.map((item) => { return { id: item.schoolSubjectId, ...item.schoolSubject } as SchoolSubjectResponse }) ?? []
                }
            },
            teachers: {
                get: getTeachersQuery,
            }
        },
        mutations: {
            academicCycleSchoolGroup: {
                createUpdate: createUpdateAcademicCycleSchoolGroupMutation
            }
        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        isLoadingPage: getAcademicCycleSchoolGroupQuery.isLoading || getTeachersQuery.isLoading || getSchoolSubjectsQuery.isLoading,
        isLoadingPageError: false,
        // isLoadingPageError: getAcademicCycleSchoolGroupQuery.isError || getTeachersQuery.isError || getSchoolSubjectsQuery.isError,
    }
}
