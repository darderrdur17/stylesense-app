import type { SetUserResult, UserProfile } from "./types";

type SetUserFn = (updates: Partial<UserProfile>) => Promise<SetUserResult>;

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
        const saved = await setUser({
          latitude: lat,
          longitude: lng,
          location: locationLabel,
        });
        if (!saved.ok) {
          resolve({ ok: false, error: saved.error });
          return;
        }
        resolve({ ok: true });
      },
      (err) => {
        const code = (err as GeolocationPositionError)?.code;
        let message = err.message || "Could not get your location.";
        if (code === 1) {
          message =
            "Location permission was denied. Enable it in your browser settings for this site, then try again.";
        } else if (code === 2) {
          message = "Your position could not be determined. Try again or set your city in Profile.";
        } else if (code === 3) {
          message = "Location request timed out. Try again.";
        }
        resolve({
          ok: false,
          error: message,
        });
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 }
    );
  });
}
