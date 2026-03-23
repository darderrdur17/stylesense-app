import { ClothingItem, WeatherData, Season, Outfit } from "./types";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getSeasonFromMonth(month: number): Season {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export function getCurrentSeason(): Season {
  return getSeasonFromMonth(new Date().getMonth());
}

export function getWarmthNeeded(temp: number): number {
  if (temp <= 0) return 5;
  if (temp <= 10) return 4;
  if (temp <= 18) return 3;
  if (temp <= 25) return 2;
  return 1;
}

export function filterItemsByWeather(
  items: ClothingItem[],
  weather: WeatherData
): ClothingItem[] {
  const warmthNeeded = getWarmthNeeded(weather.temp);
  const season = getSeasonFromMonth(new Date().getMonth());

  return items.filter((item) => {
    const warmthMatch = Math.abs(item.warmthLevel - warmthNeeded) <= 1;
    const seasonMatch =
      item.season.includes(season) || item.season.includes("all");
    const rainMatch =
      weather.condition !== "rainy" ||
      item.waterproof ||
      item.category !== "outerwear";
    return warmthMatch && seasonMatch && rainMatch;
  });
}

export function suggestOutfit(
  items: ClothingItem[],
  weather: WeatherData
): ClothingItem[] {
  const suitable = filterItemsByWeather(items, weather);
  const outfit: ClothingItem[] = [];

  const categories: Array<
    "tops" | "bottoms" | "shoes" | "outerwear" | "accessories"
  > = ["tops", "bottoms", "shoes"];
  if (weather.temp < 18) categories.push("outerwear");
  if (weather.condition === "rainy" || weather.condition === "sunny")
    categories.push("accessories");

  for (const cat of categories) {
    const candidates = suitable.filter((i) => i.category === cat);
    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      outfit.push(pick);
    }
  }

  return outfit;
}

export function formatTemp(temp: number, unit: "celsius" | "fahrenheit") {
  if (unit === "fahrenheit") {
    return `${Math.round(temp * 1.8 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getWeatherEmoji(condition: string): string {
  const map: Record<string, string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    windy: "💨",
    stormy: "⛈️",
    foggy: "🌫️",
  };
  return map[condition] || "🌤️";
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    tops: "👕",
    bottoms: "👖",
    dresses: "👗",
    outerwear: "🧥",
    shoes: "👟",
    accessories: "👜",
    activewear: "🏃",
    formal: "👔",
  };
  return map[category] || "👚";
}

export function matchScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const intersection = b.filter((x) => setA.has(x));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : Math.round((intersection.length / union.size) * 100);
}
