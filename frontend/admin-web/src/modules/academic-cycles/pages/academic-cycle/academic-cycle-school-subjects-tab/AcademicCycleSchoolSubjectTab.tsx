import { useAcademicCycleSchoolSubjectTab } from "./hooks/useAcademicCycleSchoolSubjectTab"

export const AcademicCycleSchoolSubjectTab = () => {

    const { context } = useAcademicCycleSchoolSubjectTab();

    return (
        <>
            {/* Create & update school subject relation form */}
            {
                !context.isLocked && (
                    <form className="flex flex-col gap-y-8">
                        <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                            <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                                <h2 className="w-full text-muted-foreground">
                                    ASOCIACIÓN DE MATERIA ESCOLAR AL CICLO ESCOLAR
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    En esta sección podrás configurar aquellas materias escolares que deberán cursar los alumnos una vez inscritos a este ciclo escolar.
                                </p>
                            </div>

                            {/* Fields */}
                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-2 block">Materia <span className="text-destructive">*</span>:</label>
                                    {/* <CustomSearchInput
                                        {...register("paymentConceptId", { required: true })}
                                        defaultValue={watch("paymentConcept.name")}
                                        selected={!!selectedPaymentConceptId}
                                        placeholder="Busqueda de concepto de pago"
                                        options={searchPaymentConcepts.paymentConcepts ?? []}
                                        isSearching={searchPaymentConcepts.isPending}
                                        onClearSelection={() => {
                                            setValue("paymentConceptId", undefined);
                                            setValue("paymentConcept.name", undefined);
                                            setValue("amount", undefined);
                                            setValue("dueDate", undefined);
                                            setValue("allowForgiveness", false);
                                        }}
                                        onOptionChange={async (option: PaymentConcept) => {
                                            setValue("paymentConceptId", option.id);
                                            setValue("paymentConcept.name", option.name);
                                            setValue("amount", option.amount);
                                            setValue("allowForgiveness", option.allowForgiveness);
                                            searchPaymentConcepts.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchPaymentConcepts.searchAsync(query)}
                                    />
                                    {
                                        (errors.paymentConceptId && !selectedPaymentConceptId) && (
                                            <p className="text-red-500 text-sm mt-2">
                                                El concepto de pago es obligatorio
                                            </p>
                                        )
                                    } */}
                                </div>
                            </section>
                            <div className="w-full flex justify-end items-center col-span-1 md:col-span-2 xl:col-span-3 mt-4">
                                {/* <Button type="submit">
                                    {isNew ? "Registrar nuevo" : "Actualizar concepto de pago"}
                                    <Plus className="ml-4 w-4 h-4" />
                                </Button> */}
                            </div>
                        </section>
                    </form>
                )
            }

            {/* School subjects table section */}
            <section className="flex flex-col gap-y-6">
                <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        LISTADO DE MATERIAS ESCOLARES ASIGNADAS PARA EL CICLO ESCOLAR
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        El siguiente listado contiene la información de las materias escolares que serán impartidas para los alumnos que sean inscritos a este ciclo escolar.
                    </p>
                </div>

                {/* School subjects table */}

            </section>
        </>
    )
}
