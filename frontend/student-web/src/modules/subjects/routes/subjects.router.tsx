// Rutas del módulo Materias escolares

import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { SubjectsPage } from "../pages/SubjectsPage";
import { SchoolSubjectDetailPage } from "../pages/SchoolSubjectDetailPage";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const SubjectsLayout = lazy(() => import('@/modules/subjects/layouts/SubjectsLayout'));

export const subjectsRouter: RouteObject = {
    path: '/subjects',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <SubjectsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <SubjectsPage />
        },
        {
            path: ':academicCycleSchoolSubjectId',
            element: <SchoolSubjectDetailPage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default subjectsRouter;
