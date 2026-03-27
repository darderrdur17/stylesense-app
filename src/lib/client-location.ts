import type { SetUserResult, UserProfile } from "./types";
import { reverseGeocodeOpenMeteoClient } from "./open-meteo-reverse-client";

type SetUserFn = (updates: Partial<UserProfile>) => Promise<SetUserResult>;

async function resolvePlaceLabel(
  lat: number,
  lng: number,
  fallbackHint: string
): Promise<string> {
  try {
    const r = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
      { credentials: "include" }
    );
    const data = (await r.json()) as { label?: string };
    if (r.ok && data.label?.trim()) return data.label.trim();
  } catch {
    /* try direct */
  }
  const direct = await reverseGeocodeOpenMeteoClient(lat, lng);
  if (direct?.trim()) return direct.trim();
  const hint = fallbackHint.trim();
  if (hint) return hint;
  return "Current location";
}

/**
 * Browser geolocation + reverse geocode, then PATCH profile (saved to Postgres via /api/profile).
 * Requests a fresh, higher-accuracy fix and writes real coordinates plus a resolved place name.
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
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          resolve({ ok: false, error: "Your device returned an invalid position. Try again." });
          return;
        }
        const fallbackHint = opts?.fallbackLocationLabel?.trim() ?? "";
        const locationLabel = await resolvePlaceLabel(lat, lng, fallbackHint);
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
          message =
            "Your position could not be determined. Try again or set your city in Profile.";
        } else if (code === 3) {
          message = "Location request timed out. Try again.";
        }
        resolve({
          ok: false,
          error: message,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 25_000,
      }
    );
  });
}
