import { z } from "zod";

export const clothingCategorySchema = z.enum([
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
  "activewear",
  "formal",
]);

export const seasonSchema = z.enum(["spring", "summer", "fall", "winter", "all"]);

export const styleTagSchema = z.enum([
  "casual",
  "formal",
  "athletic",
  "streetwear",
  "bohemian",
  "minimalist",
  "vintage",
  "preppy",
  "elegant",
]);

export const createClothingSchema = z.object({
  name: z.string().min(1).max(200),
  category: clothingCategorySchema,
  color: z.string().min(1).max(80),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  season: z.array(seasonSchema).min(1),
  style: z.array(styleTagSchema).min(1),
  imageUrl: z.string().min(1).max(10_000_000),
  warmthLevel: z.number().int().min(1).max(5),
  waterproof: z.boolean(),
  favorite: z.boolean().optional(),
  photoCapturedAt: z.string().max(40).optional(),
  photoLat: z.number().optional(),
  photoLng: z.number().optional(),
  photoPlaceLabel: z.string().max(300).optional(),
});

export const updateClothingSchema = createClothingSchema.partial();

export const outfitSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(z.string()),
  style: z.array(styleTagSchema),
  occasion: z.string().optional(),
  rating: z.number().optional(),
});

export const weatherDataSchema = z.object({
  temp: z.number(),
  feelsLike: z.number(),
  condition: z.enum([
    "sunny",
    "cloudy",
    "rainy",
    "snowy",
    "windy",
    "stormy",
    "foggy",
  ]),
  description: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  icon: z.string(),
  high: z.number(),
  low: z.number(),
});

export const createMemorySchema = z.object({
  outfit: outfitSchema,
  photoUrl: z.string().optional(),
  location: z.string().min(1).max(300),
  locationCoords: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
  weather: weatherDataSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.string().max(80).optional(),
  notes: z.string().max(5000).optional(),
});

export const dayPlanSchema = z.object({
  date: z.string(),
  weather: weatherDataSchema,
  dayOutfit: outfitSchema,
  eveningOutfit: outfitSchema.optional(),
  notes: z.string().optional(),
});

export const createTripSchema = z.object({
  destination: z.string().min(1).max(300),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dailyOutfits: z.array(dayPlanSchema),
  packingList: z.array(z.string()),
  status: z.enum(["planning", "packed", "traveling", "completed"]),
});

export const updateTripSchema = createTripSchema.partial();

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  location: z.string().min(1).max(200).optional(),
  latitude: z.union([z.number().gte(-90).lte(90), z.null()]).optional(),
  longitude: z.union([z.number().gte(-180).lte(180), z.null()]).optional(),
  temperatureUnit: z.enum(["celsius", "fahrenheit"]).optional(),
  preferredStyles: z.array(styleTagSchema).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const outfitFeedbackSchema = z.object({
  liked: z.boolean(),
  itemIds: z.array(z.string()).min(1),
  weather: weatherDataSchema,
});
