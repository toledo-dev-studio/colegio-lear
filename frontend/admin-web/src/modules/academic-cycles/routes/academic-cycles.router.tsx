import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router"
import { AcademicCyclesPage } from "../pages/academic-cycles/AcademicCyclesPage";
import { AcademicCycleLayout } from "../layouts/AcademicCycleLayout";
import { AcademicCycleTab } from "../pages/academic-cycle/academic-cycle-tab/AcademicCycleTab";
import { AcademicCycleSchoolSubjectTab } from "../pages/academic-cycle/academic-cycle-school-subjects-tab/AcademicCycleSchoolSubjectTab";
import { AcademicCycleWalletTab } from "../pages/academic-cycle/academic-cycle-wallet-tab/AcademicCycleWalletTab";
import { AcademicCycleSchoolGroupTab } from "../pages/academic-cycle/academic-cycle-school-group-tab/AcademicCycleSchoolGroupTab";

const SystemLayout = lazy(() => import("@/shared/layouts/SystemLayout"));
const AcademicCyclesLayout = lazy(() => import("@/modules/academic-cycles/layouts/AcademicCyclesLayout"));

export const academicCyclesRouter: RouteObject = {
    path: "/academic-cycles",
    element:
        // REMOVE: CUANDO SE CAMBIE EL KEY DEL MODULO academic-years POR academic-cycles EN LA INTERFAZ DE MODULES
        // <AuthenticatedRoute moduleKey="academic-cycles">
        //     <SystemLayout>
        //         <AcademicCyclesLayout />
        //     </SystemLayout>
        // </AuthenticatedRoute>,
        <SystemLayout>
            <AcademicCyclesLayout />
        </SystemLayout>,
    children: [
        {
            path: "",
            element: <AcademicCyclesPage />
        },
        {
            path: ":id",
            element: <AcademicCycleLayout />,
            children: [
                {
                    index: true,
                    element: <AcademicCycleTab />
                },
                {
                    path: "school-subjects",
                    element: <AcademicCycleSchoolSubjectTab />
                },
                {
                    path: "school-groups",
                    element: <AcademicCycleSchoolGroupTab />
                },
                {
                    path: "wallet",
                    element: <AcademicCycleWalletTab />
                }
            ]
        },
        {
            path: "*",
            element: <Navigate to="/academic-cycles" />
        }
    ]
}

export default academicCyclesRouter;