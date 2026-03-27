/**
 * Open-Meteo reverse geocoding from the browser (no API key).
 * Shared by client-location and hooks that need a place name from lat/lng.
 */
export async function reverseGeocodeOpenMeteoClient(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}&language=en`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { name: string; admin1?: string; country?: string }[];
    };
    const r = data.results?.[0];
    if (!r) return null;
    const parts = [r.name, r.admin1, r.country].filter(Boolean);
    return parts.length ? parts.join(", ") : r.name;
  } catch {
    return null;
  }
}
