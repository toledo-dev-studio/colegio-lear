import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router"
import { AcademicCycleLayout } from "../layouts/AcademicCycleLayout";
import { AcademicCyclesPage } from "../pages/academic-cycles/AcademicCyclesPage";
import { AcademicCycleContextLayout } from "../layouts/AcademicCycleContextLayout";
import { AcademicCycleTab } from "../pages/academic-cycle/academic-cycle-tab/AcademicCycleTab";
import { AcademicCycleEnrollmentPage } from "../pages/academic-cycle-enrollment/AcademicCycleEnrollmentPage";
import { AcademicCycleSchoolGroupPage } from "../pages/academic-cycle-school-group/AcademicCycleSchoolGroupPage";
import { AcademicCycleWalletTab } from "../pages/academic-cycle/academic-cycle-wallet-tab/AcademicCycleWalletTab";
import { AcademicCycleEnrollmentsTab } from "../pages/academic-cycle/academic-cycle-enrollments-tab/AcademicCycleEnrollmentsTab";
import { AcademicCycleSchoolGroupsTab } from "../pages/academic-cycle/academic-cycle-school-groups-tab/AcademicCycleSchoolGroupsTab";
import { AcademicCycleSchoolSubjectsTab } from "../pages/academic-cycle/academic-cycle-school-subjects-tab/AcademicCycleSchoolSubjectsTab";

const SystemLayout = lazy(() => import("@/shared/layouts/SystemLayout"));
const AcademicCyclesLayout = lazy(() => import("@/modules/academic-cycles/layouts/AcademicCyclesLayout"));

export const academicCyclesRouter: RouteObject = {
    path: "/academic-cycles",
    element:
        <AuthenticatedRoute moduleKey="academic-cycles">
            <SystemLayout>
                <AcademicCyclesLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <AcademicCyclesPage />
        },
        {
            path: ":id",
            element: <AcademicCycleContextLayout />,
            children: [
                {
                    path: "",
                    element: <AcademicCycleLayout />,
                    children: [
                        {
                            index: true,
                            element: <AcademicCycleTab />
                        },
                        {
                            path: "wallet",
                            element: <AcademicCycleWalletTab />
                        },
                        {
                            path: "school-subjects",
                            element: <AcademicCycleSchoolSubjectsTab />
                        },
                        {
                            path: "school-groups",
                            element: <AcademicCycleSchoolGroupsTab />
                        },
                        {
                            path: "enrollments",
                            element: <AcademicCycleEnrollmentsTab />
                        }
                    ]
                },
                {
                    path: "school-groups/:schoolGroupId",
                    element: <AcademicCycleSchoolGroupPage />
                },
                {
                    path: "enrollments/:enrollmentId",
                    element: <AcademicCycleEnrollmentPage />
                }
            ]
        },
        {
            path: "*",
            element: <Navigate to="/academic-cycles" />
        },
    ]
}

export default academicCyclesRouter;