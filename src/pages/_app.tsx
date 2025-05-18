import React from "react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ClientOnlyToastContainer } from "@/components/ClientOnlyToastContainer";
import { AxiosError } from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response?.status === 429) {
          return failureCount < 3;
        }
        return false;
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      <ClientOnlyToastContainer />
    </QueryClientProvider>
  );
}

export default MyApp;
