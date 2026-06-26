"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SWRConfig, useSWRConfig } from "swr";
import { fetcher, getApiBase, setApiBase as persistApiBase } from "@/lib/api";

interface ApiCtx {
  apiBase: string;
  updateApiBase: (base: string) => void;
}

const ApiContext = createContext<ApiCtx>({ apiBase: "", updateApiBase: () => {} });

export function useApiBase() {
  return useContext(ApiContext);
}

function ApiBaseProvider({ children }: { children: React.ReactNode }) {
  const [apiBase, setApiBase] = useState("");
  const { mutate } = useSWRConfig();

  // resolve on mount (localStorage is client-only)
  useEffect(() => {
    setApiBase(getApiBase());
  }, []);

  const updateApiBase = useCallback(
    (base: string) => {
      persistApiBase(base);
      setApiBase(getApiBase());
      // drop every cached response so all panels refetch against the new host
      mutate(() => true, undefined, { revalidate: true });
    },
    [mutate],
  );

  return (
    <ApiContext.Provider value={{ apiBase, updateApiBase }}>
      {children}
    </ApiContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        dedupingInterval: 4000,
      }}
    >
      <ApiBaseProvider>{children}</ApiBaseProvider>
    </SWRConfig>
  );
}
