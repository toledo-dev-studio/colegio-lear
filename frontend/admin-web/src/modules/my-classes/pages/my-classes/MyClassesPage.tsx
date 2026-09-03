import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";
import { Table } from "@/shared/components/table/Table";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useMyClassesPage } from "./hooks/useMyClassesPage";
import { useMyClassesPageTable } from "./hooks/useMyClassesPageTable";
import { MyClassesAdvancedFilters } from "./components/MyClassesAdvancedFilters";

export const MyClassesPage = () => {
    // Component hooks & stores
    const { advancedFilters, queries } = useMyClassesPage();
    const { columns, properties } = useMyClassesPageTable();

    if (queries.myClasses.paged.isError) {
        showApiErrorToast(queries.myClasses.paged.error, "No fue posible obtener información de las clases");
    }

    return (
        <>
            <section className="page-main-section">

                <Breadcrumb items={[
                    { label: "Seguimiento escolar" },
                    { label: "Mis clases" },
                ]} />

                <PageTitle title="Mis clases" subtitle="Consulta los grupos escolares que tienes asignados en el colegio" />

                {/* Table ribbon options */}
                <TableRibbon
                    addButton={{show: false}}
                    exportButton={{show: false}}
                    filterButton={{ handleClick: advancedFilters.open }}
                    searchInput={{ tooltip: "Búsqueda general por nombre del grupo", placeholder: "Búsqueda general por nombre del grupo" }}
                />

                {/* Table content */}
                <Table
                    data={queries.myClasses.paged.data}
                    isLoading={queries.myClasses.paged.isFetching}
                    enablePagination={true}
                    columns={columns}
                    properties={properties}
                    actions={[]}
                    totalPages={queries.myClasses.paged.totalPages}
                />

                {/* Advanced filters panel */}
                {
                    advancedFilters.isOpen && (
                        <MyClassesAdvancedFilters
                            open={advancedFilters.isOpen}
                            title="Filtros avanzados"
                            handleClickClose={advancedFilters.close}
                        />
                    )
                }

            </section>
        </>
    )
}