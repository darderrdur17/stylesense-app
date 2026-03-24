import type { UserProfile } from "./types";

type SetUserFn = (updates: Partial<UserProfile>) => Promise<void>;

/**
 * Browser geolocation + reverse geocode, then PATCH profile (saved to Postgres via /api/profile).
 */
export async function requestGeolocationAndSaveProfile(
  setUser: SetUserFn,
  opts?: { fallbackLocationLabel?: string }
): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { ok: false, error: "Location is not supported in this browser." };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let locationLabel = opts?.fallbackLocationLabel?.trim() ?? "";
        try {
          const r = await fetch(
            `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
            { credentials: "include" }
          );
          const data = (await r.json()) as { label?: string };
          if (r.ok && data.label?.trim()) locationLabel = data.label.trim();
        } catch {
          /* keep fallback */
        }
        if (!locationLabel) locationLabel = "Near you";
        await setUser({
          latitude: lat,
          longitude: lng,
          location: locationLabel,
        });
        resolve({ ok: true });
      },
      (err) => {
        resolve({
          ok: false,
          error: err.message || "Could not get your location.",
        });
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 }
    );
  });
}
