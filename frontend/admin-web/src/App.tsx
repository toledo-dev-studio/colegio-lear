import { RouterProvider } from "react-router"
import { Toaster } from "./shared/ui/sonner";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { appRouter } from "./routes/app.router";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { ThemeContextProvider } from "./shared/context/ThemeContext";
import { LoaderContextProvider } from "./shared/context/LoaderContext";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster />

        {/* App context provider */}
        <ThemeContextProvider>

          {/* Loader context provider with Zustand */}
          <LoaderContextProvider>

            <TooltipProvider>
              {/* TODO: auth provider */}
              <RouterProvider router={appRouter} />

            </TooltipProvider>

          </LoaderContextProvider>

          <ReactQueryDevtools initialIsOpen={false} />

        </ThemeContextProvider>
        
      </QueryClientProvider>
    </>
  )
}

