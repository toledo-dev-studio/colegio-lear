import { RouterProvider } from "react-router"

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { appRouter } from "./routes/app.router";
import { Toaster } from "./shared/ui/sonner";
import { LoaderContextProvider } from "./shared/context/LoaderContext";
import { TooltipProvider } from "@/shared/ui/tooltip"

const queryClient = new QueryClient();

export const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster />

        {/* Loader context provider with Zustand */}
        <LoaderContextProvider>

          <TooltipProvider>

            {/* TODO: auth provider */}
            <RouterProvider router={appRouter} />

          </TooltipProvider>

        </LoaderContextProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}

