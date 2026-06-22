"use client";

import { useEffect, useState } from "react";

/** Charge des données async et expose { data, loading, error }. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      setLoading(true);
      setError(null);
      fn()
        .then((d) => alive && setData(d))
        .catch((e) => alive && setError(e?.message ?? "Erreur de chargement"))
        .finally(() => alive && setLoading(false));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
