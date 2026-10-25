import { Building2, Cake, ClipboardList, Droplet, Fingerprint, Hash, Mail, Map, MapPin, Phone, Stethoscope } from "lucide-react";

import type { StudentResponse } from "@/interfaces/responses/student.response";
import { OverviewCard } from "@/shared/components/overview-card/OverviewCard";
import { BLOOD_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { calculateYears, formatFriendlyDate } from "@/lib/extensions/formatters";

interface Props {
    student?: StudentResponse;
}

// Sección de datos personales y médicos del alumno

export const PersonalDataSection = ({ student }: Props) => {
    return (
        <>
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                <OverviewCard
                    icon={Hash}
                    label="Matrícula"
                    value={student?.enrollment}
                />

                <OverviewCard
                    icon={Mail}
                    label="Correo electrónico"
                    value={student?.email}
                />

                <OverviewCard
                    icon={Phone}
                    label="Teléfono"
                    value={student?.phoneNumber}
                />

                <OverviewCard
                    icon={Fingerprint}
                    label="CURP"
                    value={student?.curp}
                />

                <OverviewCard
                    icon={Cake}
                    label="Fecha de nacimiento"
                    value={student ? formatFriendlyDate(student.dateOfBirth) : undefined}
                    hint={student ? `${calculateYears(student.dateOfBirth)} años` : undefined}
                />

                <OverviewCard
                    icon={MapPin}
                    label="Domicilio"
                    value={student?.address}
                />

                <OverviewCard
                    icon={Map}
                    label="Estado"
                    value={student?.state}
                />

                <OverviewCard
                    icon={Building2}
                    label="Municipio"
                    value={student?.municipality}
                />

                <OverviewCard
                    icon={Hash}
                    label="Código postal"
                    value={student?.postalCode}
                />

                <OverviewCard
                    icon={Droplet}
                    label="Tipo sanguíneo"
                    value={student ? labelOf(BLOOD_TYPES, student.bloodType) : undefined}
                />

                {
                    student?.medicalNotes && (
                        <OverviewCard
                            icon={Stethoscope}
                            label="Notas médicas"
                            value={student.medicalNotes}
                        />
                    )
                }

                {
                    student?.observations && (
                        <OverviewCard
                            icon={ClipboardList}
                            label="Observaciones"
                            value={student.observations}
                        />
                    )
                }

            </section>
        </>
    )
}