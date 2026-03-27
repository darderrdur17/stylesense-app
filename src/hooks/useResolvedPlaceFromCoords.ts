"use client";

import { useEffect, useState } from "react";
import { reverseGeocodeOpenMeteoClient } from "@/lib/open-meteo-reverse-client";

/**
 * Resolves a human-readable place from saved profile coordinates so the UI matches
 * where weather is actually fetched (independent of stale `user.location` text).
 */
export function useResolvedPlaceFromCoords(
  lat: number | null,
  lng: number | null
): { label: string | null; loading: boolean } {
  const [label, setLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      if (
        lat == null ||
        lng == null ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        setLabel(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLabel(null);

      void (async () => {
        let resolved: string | null = null;
        try {
          const r = await fetch(
            `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
            { credentials: "include" }
          );
          const data = (await r.json()) as { label?: string };
          if (r.ok && data.label?.trim()) resolved = data.label.trim();
        } catch {
          /* fallback below */
        }
        if (!resolved) {
          resolved = await reverseGeocodeOpenMeteoClient(lat, lng);
        }
        if (!cancelled) {
          setLabel(resolved?.trim() ?? null);
          setLoading(false);
        }
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return { label, loading };
}
