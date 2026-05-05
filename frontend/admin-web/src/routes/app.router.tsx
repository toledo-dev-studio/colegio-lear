import { createBrowserRouter, Navigate } from "react-router";

import authRouter from "@/modules/auth/routes/auth.router";
import academicLevelsRouter from "@/modules/academic-levels/routes/academic-levels.router";
import dashboardRouter from "@/modules/dashboard/routes/dashboard.router";
import jobTitlesRouter from "@/modules/job-titles/routes/job-titles.router";
import schoolSubjectRouter from "@/modules/school-subjects/routes/school-subject.router";
import employeeRouter from "@/modules/employees/routes/employee.router";
import scholarshipsRouter from "@/modules/scholarships/routes/scholarships.router";

export const appRouter = createBrowserRouter([
    /** Auth */
    authRouter,
    /** Dashboard */
    dashboardRouter,


    /** academic-levels */
    academicLevelsRouter,
    /** school-subjects */
    schoolSubjectRouter,
    /** scholarships */
    scholarshipsRouter,


    /** job-titles */
    jobTitlesRouter,
    /** employees */
    employeeRouter,
    {
        path: '*',
        element: <Navigate to='/auth/login' />
    }
]);
