import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import { LoginPage } from "@/modules/auth/pages/login/LoginPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { ForgotPassword } from "@/modules/auth/pages/forgot-password/ForgotPassword";
import { SystemUsersPage } from "@/modules/system-users/pages/system-users/SystemUsersPage";
import { JobTitlesPage } from "@/modules/job-titles/pages/job-titles/JobTitlesPage";
import { JobTitlePage } from "@/modules/job-titles/pages/job-title/JobTitlePage";
import { AcademicLevelsPage } from "@/modules/academic-levels/pages/academic-levels/AcademicLevelsPage";
import { AcademicLevelPage } from "@/modules/academic-levels/pages/academic-level/AcademicLevelPage";

// Lazy load de layout para optimizar carga inicial
const AuthLayout = lazy(() => import('@/modules/auth/layout/AuthLayout'));
const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const DashboardLayout = lazy(() => import('@/modules/dashboard/layout/DashboardLayout'));
const SystemUsersLayout = lazy(() => import('@/modules/system-users/layout/SystemUsersLayout'));
const JobTitlesLayout = lazy(() => import('@/modules/job-titles/layout/JobTitlesLayout'));
const AcademicLevelsLayout = lazy(() => import('@/modules/academic-levels/layout/AcademicLevelsLayout'));

export const appRouter = createBrowserRouter([
    // Auth routes
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            {
                index: true,
                element: <Navigate to='/auth/login' />
            },
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path: 'forgot-password',
                element: <ForgotPassword />
            }
        ]
    },
    {
        path: '/dashboard',
        element:
            <SystemLayout>
                <DashboardLayout />
            </SystemLayout>,
        children: [
            {
                path: '',
                element: <DashboardPage />
            },
            {
                path: '*',
                element: <Navigate to='/dashboard' />
            }
        ]
    },
    /** academic-levels */
    {
        path: '/academic-levels',
        element:
            <SystemLayout>
                <AcademicLevelsLayout />
            </SystemLayout>,
        children: [
            {
                path: '',
                element: <AcademicLevelsPage />
            },
            {
                path: ':id',
                element: <AcademicLevelPage />
            },
            {
                path: '*',
                element: <Navigate to='/academic-levels' />
            }
        ]
    },
    /** system-users */
    {
        path: '/system-users',
        element:
            <SystemLayout>
                <SystemUsersLayout />
            </SystemLayout>,
        children: [
            {
                path: '',
                element: <SystemUsersPage />
            },
            {
                path: '*',
                element: <Navigate to='/system-users' />
            }
        ]
    },

    /** academic-levels */
    {
        path: '/job-titles',
        element:
            <SystemLayout>
                <JobTitlesLayout />
            </SystemLayout>,
        children: [
            {
                path: '',
                element: <JobTitlesPage />
            },
            {
                path: ':id',
                element: <JobTitlePage />
            },
            {
                path: '*',
                element: <Navigate to='/job-titles' />
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to='/auth/login' />
    }
]);
