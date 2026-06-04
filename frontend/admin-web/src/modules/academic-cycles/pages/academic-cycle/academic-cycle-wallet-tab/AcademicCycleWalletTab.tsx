import { Navigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Banknote, Pencil, Plus, Trash } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker";
import { CustomSearchInput } from "@/shared/components/CustomSearchInput";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";
import { useAcademicCycleWalletTab } from "./hooks/useAcademicCycleWalletTab";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { useSearchPaymentConcepts } from "@/modules/payment-concepts/hooks/useSearchPaymentConcepts";

export const AcademicCycleWalletTab = () => {
    // Hooks & stores
    const { context, queries, mutations, tableStructure, deleteModal, loader } = useAcademicCycleWalletTab();

    // Use hook form configuration
    const { control, register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<Partial<AcademicCycleWallet>>({
        defaultValues: {
            id: undefined,
            academicCycleId: context.academicCycleId,
            amount: undefined,
            allowForgiveness: false,
            dueDate: undefined,
            paymentConceptId: undefined,
            paymentConcept: undefined,
        }
    });
    // Is a new record
    const isNew = watch("id") === undefined ? true : false;

    // Payment concept select configuration
    const selectedPaymentConceptId = watch("paymentConceptId");
    const searchPaymentConcepts = useSearchPaymentConcepts();

    const tableActionsStructure: TableAction<AcademicCycleWallet>[] = context.isLocked ? [] : [
        {
            key: "edit",
            render: (item: AcademicCycleWallet) => (
                <Button
                    aria-label="Editar"
                    className="icon-btn-sm bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => reset(item)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycleWallet) => (
                <Button
                    aria-label="Eliminar"
                    className="icon-btn-sm bg-destructive text-primary-foreground hover:bg-destructive/90"
                    onClick={() => deleteModal.open(item)}>
                    <Trash className="w-4 h-4" />
                </Button>
            )
        }
    ];

    const resetFormToDefaultValues = () => {
        reset({
            id: undefined,
            academicCycleId: context.academicCycleId,
            amount: undefined,
            allowForgiveness: false,
            dueDate: undefined,
            paymentConceptId: undefined,
            paymentConcept: undefined,
        });
    }

    const handleClickConfirmDeleteWallet = async () => {
        if (!deleteModal.record)
            return;
        await mutations.deleteWalletByIdForAcademicCycle.mutateAsync({ academicCycleId: context.academicCycleId, academicCycleWalletId: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("Concepto de pago eliminado correctamente", { position: "top-right" });
                    deleteModal.close();
                    resetFormToDefaultValues();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el concepto de pago seleccionado", { position: "top-right" });
                }
            }
        )
    }

    const onSubmit = async (academicCycleWalletLike: Partial<AcademicCycleWallet>) => {
        try {
            console.log(academicCycleWalletLike);

            loader.show("Guardando");
            await mutations.createUpdateWalletForAcademicCycle.mutateAsync({ academicCycleWalletLike }, {
                onSuccess: () => {
                    toast.success("Concepto de pago agregado a la cartera del ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    resetFormToDefaultValues();
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de guardar el registro", { position: "top-right" });
        }
    }

    if (queries.walletForAcademicCycleQuery.isError) {
        toast.error("No fue posible obtener información de la cartera del ciclo escolar", { position: "top-right" });
        return <Navigate to="/academic-cycles" />;
    }

    if (queries.walletForAcademicCycleQuery.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full my-4">
                    <CustomFullScreenLoading className="relative" title="Cargando cartera de ciclo escolar" subtitle="Por favor espere..." />
                </div>
            </>
        );
    }

    return (
        <>
            {/* Create & update payment concept form */}
            {
                !context.isLocked && (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-8">
                        <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                            <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                                <h2 className="w-full text-muted-foreground">
                                    ASOCIACIÓN DE CONCEPTOS DE PAGO AL CICLO ESCOLAR
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    En esta sección podrás configurar aquellos conceptos de pago que deberán saldar los alumnos una vez inscritos a este ciclo escolar.
                                </p>
                            </div>

                            {/* Fields */}
                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-2 block">Concepto de pago <span className="text-destructive">*</span>:</label>
                                    <CustomSearchInput
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
                                    }
                                </div>
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Monto de pago (MXN)<span className="text-destructive">*</span>:
                                    </label>
                                    <Controller
                                        name="amount"
                                        control={control}
                                        rules={{
                                            required: true,
                                            validate: {
                                                integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                                nonNegative: (v) => v! >= 1 || "El monto de pago no puede ser menor o igual a 0",
                                            },
                                        }}
                                        disabled={!selectedPaymentConceptId}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    className="pill-input w-full pl-8 pr-13"
                                                    step={1}
                                                    min={1}
                                                    disabled={!selectedPaymentConceptId}
                                                    inputMode="numeric"
                                                    placeholder="Monto de pago..."
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                    onKeyDown={(e) => { if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault(); }}
                                                />
                                            </div>
                                        )} />
                                    {
                                        errors.amount && (
                                            <p className="text-red-500 text-sm mt-2">
                                                {errors.amount.message || 'El monto de pago es obligatorio'}
                                            </p>
                                        )
                                    }
                                    <p className="text-xs text-muted-foreground mt-1.5">Solo valores enteros — sin decimales</p>
                                </div>
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-2 block">Entre límite de pago <span className="text-destructive">*</span>:</label>
                                    <Controller
                                        name="dueDate"
                                        control={control}
                                        disabled={!selectedPaymentConceptId}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <CustomDatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={!selectedPaymentConceptId}
                                            />
                                        )}
                                    />
                                    {
                                        errors.dueDate && (
                                            <p className="text-red-500 text-sm mt-2">
                                                La fecha límite de pago es requerido
                                            </p>
                                        )
                                    }
                                </div>
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-3 block">
                                        ¿Permitir condonación?:
                                    </label>
                                    <div className="flex items-center justify-center">
                                        <Controller
                                            name="allowForgiveness"
                                            control={control}
                                            disabled={!selectedPaymentConceptId}
                                            render={({ field }) => (
                                                <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{field.value ? "Sí" : "No"}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">El administrador podrá condonar este concepto por alumno según su ciclo escolar.</p>
                                                    </div>
                                                    <Switch disabled={!selectedPaymentConceptId} checked={field.value} onCheckedChange={field.onChange} />
                                                </label>
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>
                            <div className="w-full flex justify-end items-center col-span-1 md:col-span-2 xl:col-span-3 mt-4">
                                <Button type="submit">
                                    {isNew ? "Registrar nuevo" : "Actualizar concepto de pago"}
                                    <Plus className="ml-4 w-4 h-4" />
                                </Button>
                            </div>
                        </section>
                    </form>
                )
            }

            {/* Wallet table section */}
            <section className="flex flex-col gap-y-6">
                <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        LISTADO DE CONCEPTOS DE PAGO ASOCIADOS AL CICLO ESCOLAR
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        El siguiente listado contiene la información de los conceptos de pago para este ciclo escolar.
                    </p>
                </div>

                {/* Wallet table */}
                <Table
                    data={queries.walletForAcademicCycleQuery.data}
                    isLoading={queries.walletForAcademicCycleQuery.isFetching}
                    enablePagination={false}
                    columns={tableStructure.columns}
                    properties={tableStructure.properties}
                    actions={tableActionsStructure}
                />
            </section>

            {/* Delete single record modal */}
            {
                deleteModal.record && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.paymentConcept?.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.deleteWalletByIdForAcademicCycle.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteWallet
                        }}
                    />
                )
            }
        </>
    )
}
