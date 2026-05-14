import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { SchoolSubjectPage } from "../pages/school-subject/SchoolSubjectPage";
import { SchoolSubjectsPage } from "../pages/school-subjects/SchoolSubjectsPage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const SchoolSubjectsLayout = lazy(() => import('@/modules/school-subjects/layout/SchoolSubjectsLayout'));

export const schoolSubjectsRouter: RouteObject = {
    path: '/school-subjects',
    element:
        <SystemLayout>
            <SchoolSubjectsLayout />
        </SystemLayout>,
    children: [
        {
            path: '',
            element: <SchoolSubjectsPage />
        },
        {
            path: ':id',
            element: <SchoolSubjectPage />
        },
        {
            path: '*',
            element: <Navigate to='/school-subjects' />
        }
    ]
};

export default schoolSubjectsRouter;