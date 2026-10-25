import { Mail, Phone, ShieldCheck, Siren, UserCheck } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";
import { STUDENT_GUARDIANS_RELATIONSHIPS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";

interface Props {
    guardians: StudentGuardianResponse[];
}

const getInitials = (fullName: string): string =>
    fullName.split(" ").filter(Boolean).slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");

// Sección de tutores del alumno

export const GuardiansSection = ({ guardians }: Props) => {
    if (!guardians.length) {
        return (
            <>
                <p className="text-sm text-muted-foreground">
                    Este alumno no cuenta con tutores registrados.
                </p>
            </>
        )
    }

    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {
                    guardians.map((guardian) => (
                        <section key={guardian.id} className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4">

                            {/* Header */}
                            <section className="flex items-center gap-3">
                                <section className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-heading font-bold text-sm">
                                    {getInitials(guardian.fullName)}
                                </section>
                                <section className="min-w-0 flex-1">
                                    <p className="text-sm font-heading font-bold text-foreground truncate">{guardian.fullName}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {labelOf(STUDENT_GUARDIANS_RELATIONSHIPS, guardian.relationship)}
                                    </p>
                                </section>
                            </section>

                            {/* Contact */}
                            <section className="flex flex-col gap-1.5">
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                    {guardian.phoneNumber}
                                </p>
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{guardian.email}</span>
                                </p>
                            </section>

                            {/* Flags */}
                            <section className="flex flex-wrap items-center gap-2">
                                {
                                    guardian.isPrincipal && (
                                        <Badge variant="success">
                                            <ShieldCheck />
                                            Principal
                                        </Badge>
                                    )
                                }
                                {
                                    guardian.emergencyContact && (
                                        <Badge variant="warning">
                                            <Siren />
                                            Emergencia
                                        </Badge>
                                    )
                                }
                                {
                                    guardian.authorizedToPickUp && (
                                        <Badge variant="outline">
                                            <UserCheck />
                                            Autorizado a recoger
                                        </Badge>
                                    )
                                }
                            </section>

                            {
                                guardian.observations && (
                                    <p className="text-xs text-muted-foreground border-t border-border pt-3">
                                        {guardian.observations}
                                    </p>
                                )
                            }

                        </section>
                    ))
                }

            </section>
        </>
    )
}