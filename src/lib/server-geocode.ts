/**
 * Reverse geocode via Open-Meteo (no API key).
 */
export async function reverseGeocodePlace(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en`,
      { next: { revalidate: 86400 } }
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
