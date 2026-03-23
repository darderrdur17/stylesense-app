import exifr from "exifr";

export type ParsedExif = {
  dateIso?: string;
  latitude?: number;
  longitude?: number;
};

/**
 * Extract capture time and GPS from image bytes (JPEG/HEIC; depends on exifr).
 */
export async function parseExifFromBuffer(buf: Buffer): Promise<ParsedExif> {
  try {
    const tags = await exifr.parse(buf, { reviveValues: true, mergeOutput: true });
    if (!tags || typeof tags !== "object") return {};
    const t = tags as Record<string, unknown>;
    const out: ParsedExif = {};
    const dto = t.DateTimeOriginal ?? t.CreateDate;
    if (dto instanceof Date && !Number.isNaN(dto.getTime())) {
      out.dateIso = dto.toISOString();
    }
    const lat = typeof t.latitude === "number" ? t.latitude : undefined;
    const lng = typeof t.longitude === "number" ? t.longitude : undefined;
    if (lat != null && lng != null) {
      out.latitude = lat;
      out.longitude = lng;
    }
    return out;
  } catch {
    return {};
  }
}
