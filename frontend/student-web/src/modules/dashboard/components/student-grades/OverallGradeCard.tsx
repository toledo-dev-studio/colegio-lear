import { cn } from "@/lib/extensions/utils";
import { gradeTone } from "@/lib/extensions/student-grades";

interface Props {
    overall: number;
    passingCount: number;
    failingCount: number;
    minimumPassingGrade: number;
    totalSchoolSubjects: number;
}

export const OverallGradeCard = ({ overall, passingCount, failingCount, minimumPassingGrade, totalSchoolSubjects }: Props) => {

    const tone = gradeTone(overall, minimumPassingGrade);
    const R = 46;
    const C = 2 * Math.PI * R;
    const pct = Math.min(1, Math.max(0, overall / 10));
    const dash = C * pct;

    return (
        <section className="h-full flex flex-col items-center justify-center gap-4 bg-card hover:bg-muted/40 transition-colors rounded-lg border border-border px-5 py-10">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r={R} strokeWidth="8" className="fill-none stroke-muted" />
                    <circle
                        cx="60"
                        cy="60"
                        r={R}
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={cn(
                            "fill-none transition-all duration-500",
                            overall < minimumPassingGrade && "stroke-rose-500",
                            overall >= 9 && "stroke-emerald-500",
                            (overall >= minimumPassingGrade && overall < 9) && "stroke-sky-500"
                        )}
                        strokeDasharray={`${dash} ${C}`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-3xl font-bold font-mono leading-none ${tone.text}`} data-testid="stu-grades-overall-value">
                        {overall.toFixed(1)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-semibold">/ 10</p>
                </div>
            </div>

            <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Promedio general</p>
                <p className={`text-sm font-semibold ${tone.text}`}>
                    {overall >= 9 ? "Excelente" : overall < 9 && overall >= minimumPassingGrade ? "Aprobado" : "No aprobatorio"}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-border">
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Aprobadas</p>
                    <p className="text-xl font-bold text-emerald-600">{passingCount}<span className="text-sm text-muted-foreground font-normal">/{totalSchoolSubjects}</span></p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Reprobadas</p>
                    <p className="text-xl font-bold text-rose-600">{failingCount}<span className="text-sm text-muted-foreground font-normal">/{totalSchoolSubjects}</span></p>
                </div>
            </div>
        </section>
    );
}