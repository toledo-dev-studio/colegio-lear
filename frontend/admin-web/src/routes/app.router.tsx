import { createBrowserRouter, Navigate } from "react-router";

import authRouter from "@/modules/auth/routes/auth.router";
import academicLevelsRouter from "@/modules/academic-levels/routes/academic-levels.router";
import dashboardRouter from "@/modules/dashboard/routes/dashboard.router";
import jobTitlesRouter from "@/modules/job-titles/routes/job-titles.router";
import schoolSubjectRouter from "@/modules/school-subjects/routes/school-subjects.router";
import employeesRouter from "@/modules/employees/routes/employees.router";
import scholarshipsRouter from "@/modules/scholarships/routes/scholarships.router";
import securityRolesRouter from "@/modules/security-roles/routes/security-roles.router";
import paymentConceptsRouter from "@/modules/payment-concepts/routes/payment-concepts.router";
import myAccountRouter from "@/modules/my-account/routes/my-account.router";
import myClassesRouter from "@/modules/my-classes/routes/my-classes.router";
import announcementsRouter from "@/modules/announcements/routes/announcements.router";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ForbiddenRoute } from "./protected.router";
import { ForbiddenPage } from "@/shared/pages/ForbiddenPage";
import { studentsRouter } from "@/modules/students/routes/students.router";
import academicCyclesRouter from "@/modules/academic-cycles/routes/academic-cycles.router";
import homeRouter from "@/modules/home/routes/home.router";

export const appRouter = createBrowserRouter([
    /** auth */
    ...authRouter,
    /** home */
    homeRouter,
    /** dashboard */
    dashboardRouter,
    /** my-account */
    myAccountRouter,
    /** my-classes */
    myClassesRouter,

    /** students */
    studentsRouter,
    /** academic-cycles */
    academicCyclesRouter,
    /** announcements */
    announcementsRouter,

    /** academic-levels */
    academicLevelsRouter,
    /** school-subjects */
    schoolSubjectRouter,
    /** scholarships */
    scholarshipsRouter,
    /** payment-concepts */
    paymentConceptsRouter,

    /** employees */
    employeesRouter,
    /** job-titles */
    jobTitlesRouter,
    /** security-roles */
    securityRolesRouter,
    {
        path: "/",
        element: <Navigate to="/dashboard" />
    },
    /** Forbidden page */
    {
        path: "forbidden",
        element:
            <ForbiddenRoute>
                <ForbiddenPage />
            </ForbiddenRoute>
    },
    /** 404 not found page */
    {
        path: '*',
        element: <NotFoundPage />
    }
]);
