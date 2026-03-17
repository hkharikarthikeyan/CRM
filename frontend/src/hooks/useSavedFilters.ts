import { useState, useEffect, useCallback } from "react";

interface Filters {
  month?: string;
  leaveType?: string;
  status?: string;
}

const STORAGE_KEY = "employee_saved_filters";

export const useSavedFilters = (pageKey: string) => {
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${pageKey}`);
    if (saved) {
      setFilters(JSON.parse(saved));
    }
  }, [pageKey]);

  const updateFilter = useCallback(
    (key: keyof Filters, value: string | undefined) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(`${STORAGE_KEY}_${pageKey}`, JSON.stringify(updated));
        return updated;
      });
    },
    [pageKey]
  );

  const clearFilters = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_${pageKey}`);
    setFilters({});
  }, [pageKey]);

  return { filters, updateFilter, clearFilters };
};
