"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import type { SearchEntry } from "@/app/api/search/route";

interface UseSearchDataReturn {
  entries: SearchEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSearchData(): UseSearchDataReturn {
  const locale = useLocale();
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?locale=${locale}`);
      if (!res.ok) throw new Error("Failed to fetch search data");
      const data: SearchEntry[] = await res.json();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, error, refetch: fetchEntries };
}
