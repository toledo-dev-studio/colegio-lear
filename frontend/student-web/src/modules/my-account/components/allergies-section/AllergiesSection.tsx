import { Stethoscope } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";
import { ALLERGY_SEVERITIES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import type { AllergySeverityKey } from "@/lib/key-value-pairs/key-value-pair-types";

interface Props {
    allergies: AllergyResponse[];
}

const severityVariant: Record<AllergySeverityKey, "success" | "warning" | "destructive"> = {
    mild: "success",
    moderate: "warning",
    severe: "destructive",
};

// Sección de alergias del alumno

export const AllergiesSection = ({ allergies }: Props) => {
    if (!allergies.length) {
        return (
            <>
                <p className="text-sm text-muted-foreground">
                    Este alumno no cuenta con alergias registradas.
                </p>
            </>
        )
    }

    return (
        <>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {
                    allergies.map((allergy) => (
                        <section key={allergy.id} className="bg-card border border-border rounded-2xl shadow-sm p-5 flex items-start justify-between gap-4">

                            <section className="flex items-start gap-3 min-w-0">
                                <section className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                                    <Stethoscope className="w-4 h-4" />
                                </section>
                                <section className="min-w-0">
                                    <p className="text-sm font-heading font-bold text-foreground truncate">{allergy.name}</p>
                                    {
                                        allergy.observations && (
                                            <p className="text-xs text-muted-foreground mt-1">{allergy.observations}</p>
                                        )
                                    }
                                </section>
                            </section>

                            <Badge variant={severityVariant[allergy.severity]} className="shrink-0">
                                {labelOf(ALLERGY_SEVERITIES, allergy.severity)}
                            </Badge>

                        </section>
                    ))
                }

            </section>
        </>
    )
}