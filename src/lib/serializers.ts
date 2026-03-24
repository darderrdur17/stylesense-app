import type {
  ClothingItem as PrismaClothing,
  Memory as PrismaMemory,
  Trip as PrismaTrip,
  Inspiration as PrismaInspo,
  User,
} from "@prisma/client";
import type {
  ClothingItem,
  Outfit,
  OutfitMemory,
  StyleInspo,
  TripPlan,
  UserProfile,
  WeatherData,
} from "@/lib/types";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function userToProfile(u: User): UserProfile {
  const lat =
    u.latitude != null && Number.isFinite(Number(u.latitude)) ? Number(u.latitude) : null;
  const lng =
    u.longitude != null && Number.isFinite(Number(u.longitude)) ? Number(u.longitude) : null;
  return {
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? "",
    preferredStyles: (u.preferredStyles ?? []) as UserProfile["preferredStyles"],
    location: u.location,
    ...(lat != null && { latitude: lat }),
    ...(lng != null && { longitude: lng }),
    temperatureUnit: u.temperatureUnit as UserProfile["temperatureUnit"],
    joinDate: ymd(u.joinDate),
  };
}

export function clothingToClient(row: PrismaClothing): ClothingItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ClothingItem["category"],
    color: row.color,
    colorHex: row.colorHex,
    season: row.seasons as ClothingItem["season"],
    style: row.styles as ClothingItem["style"],
    imageUrl: row.imageUrl,
    warmthLevel: row.warmthLevel,
    waterproof: row.waterproof,
    dateAdded: ymd(row.dateAdded),
    wearCount: row.wearCount,
    favorite: row.favorite,
    ...(row.photoCapturedAt && {
      photoCapturedAt: ymd(row.photoCapturedAt),
    }),
    ...(row.photoLat != null && { photoLat: row.photoLat }),
    ...(row.photoLng != null && { photoLng: row.photoLng }),
    ...(row.photoPlaceLabel && { photoPlaceLabel: row.photoPlaceLabel }),
  };
}

export function memoryToClient(row: PrismaMemory): OutfitMemory {
  const outfit = row.outfit as unknown as Outfit;
  const weather = row.weather as unknown as WeatherData;
  return {
    id: row.id,
    outfit,
    photoUrl: row.photoUrl ?? undefined,
    location: row.location,
    locationCoords:
      row.lat != null && row.lng != null
        ? { lat: row.lat, lng: row.lng }
        : undefined,
    weather,
    date: ymd(row.date),
    mood: row.mood ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function tripToClient(row: PrismaTrip): TripPlan {
  return {
    id: row.id,
    destination: row.destination,
    startDate: ymd(row.startDate),
    endDate: ymd(row.endDate),
    dailyOutfits: row.dailyOutfits as unknown as TripPlan["dailyOutfits"],
    packingList: row.packingList,
    status: row.status as TripPlan["status"],
  };
}

export function inspoToClient(row: PrismaInspo): StyleInspo {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.imageUrl,
    tags: row.tags as StyleInspo["tags"],
  };
}
