export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "activewear"
  | "formal";

export type Season = "spring" | "summer" | "fall" | "winter" | "all";

export type StyleTag =
  | "casual"
  | "formal"
  | "athletic"
  | "streetwear"
  | "bohemian"
  | "minimalist"
  | "vintage"
  | "preppy"
  | "elegant";

export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "windy"
  | "stormy"
  | "foggy";

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  season: Season[];
  style: StyleTag[];
  imageUrl: string;
  warmthLevel: number; // 1 (very light) to 5 (very warm)
  waterproof: boolean;
  dateAdded: string;
  wearCount: number;
  favorite: boolean;
}

export interface Outfit {
  id: string;
  name: string;
  items: string[]; // clothing item IDs
  style: StyleTag[];
  occasion?: string;
  rating?: number;
}

export interface OutfitMemory {
  id: string;
  outfit: Outfit;
  photoUrl?: string;
  location: string;
  locationCoords?: { lat: number; lng: number };
  weather: WeatherData;
  date: string;
  mood?: string;
  notes?: string;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  high: number;
  low: number;
}

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  dailyOutfits: DayPlan[];
  packingList: string[];
  status: "planning" | "packed" | "traveling" | "completed";
}

export interface DayPlan {
  date: string;
  weather: WeatherData;
  dayOutfit: Outfit;
  eveningOutfit?: Outfit;
  notes?: string;
}

export interface StyleInspo {
  id: string;
  name: string;
  imageUrl: string;
  tags: StyleTag[];
  matchScore?: number;
  matchedItems?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  preferredStyles: StyleTag[];
  location: string;
  temperatureUnit: "celsius" | "fahrenheit";
  joinDate: string;
}

export interface AnalyticsData {
  totalItems: number;
  totalOutfits: number;
  mostWornCategory: ClothingCategory;
  mostWornColor: string;
  styleBreakdown: { style: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  monthlyOutfits: { month: string; count: number }[];
  seasonalUsage: { season: string; count: number }[];
  colorDistribution: { color: string; hex: string; count: number }[];
}
