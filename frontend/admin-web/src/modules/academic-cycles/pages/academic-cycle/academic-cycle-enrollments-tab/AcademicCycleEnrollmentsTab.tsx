import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useAcademicCycleEnrollmentsTab } from "./hooks/useAcademicCycleEnrollmentsTab";
import { useAcademicCycleEnrollmentsTable } from "./hooks/useAcademicCycleEnrollmentsTable";
import { AcademicCycleEnrollmentsFilters } from "./components/AcademicCycleEnrollmentsFilters";
import { type AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

export const AcademicCycleEnrollmentsTab = () => {
  // Context hooks and stores configuration
  const { context, loader, queries, mutations, deleteModal } = useAcademicCycleEnrollmentsTab();

  // Use state to enroll a new student to academic cycle
  const [academicCycleSchoolGroupEnrollment, setAcademicCycleSchoolGroupEnrollment] = useState<Partial<AcademicCycleSchoolGroupEnrollment> | undefined>();

  // Table hook configuration
  const { columns, properties, actions } = useAcademicCycleEnrollmentsTable(setAcademicCycleSchoolGroupEnrollment, deleteModal.open);

  if (queries.schoolGroups.isError) {
    toast.error("No fue posible obtener información asociada al ciclo escolar", { position: "top-right" });
    return <Navigate to="/academic-cycles" />;
  }

  if (queries.schoolGroups.isLoading) {
    return (
      <>
        <div className="w-full relative mx-auto h-full my-4">
          <CustomFullScreenLoading className="relative" title="Cargando información del ciclo escolar" subtitle="Por favor espere..." />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Search academic cycle enrollments form */}
      <AcademicCycleEnrollmentsFilters
        academicCycleSchoolGroups={queries.schoolGroups.data} />

      {/* School subjects table section */}
      <section className="flex flex-col gap-y-6">
        {/* School subjects table */}
        <Table
          data={queries.enrollments.data}
          isLoading={queries.enrollments.isFetching}
          enablePagination={true}
          columns={columns}
          properties={properties}
          actions={actions}
          totalPages={queries.enrollments.totalPages}
        />
      </section>
    </>
  )
}
