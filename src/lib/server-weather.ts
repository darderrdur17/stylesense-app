import type { WeatherCondition, WeatherData } from "@/lib/types";
import { reverseGeocodePlace } from "@/lib/server-geocode";

/** Open-Meteo geocoding → lat/lon (no API key). */
async function geocodeCity(
  city: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
      { next: { revalidate: 3600 } }
    );
    if (!geoRes.ok) return null;
    const geo = (await geoRes.json()) as {
      results?: { latitude: number; longitude: number }[];
    };
    const hit = geo.results?.[0];
    if (!hit) return null;
    return { latitude: hit.latitude, longitude: hit.longitude };
  } catch {
    return null;
  }
}

/** WMO weathercode → simplified condition */
function mapWmoDaily(code: number): WeatherCondition {
  if (code === 0) return "sunny";
  if (code <= 3) return "cloudy";
  if (code >= 45 && code <= 48) return "foggy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 95) return "stormy";
  if (code >= 85 && code <= 86) return "snowy";
  return "cloudy";
}

function wmoDescription(code: number): string {
  const table: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
  };
  return table[code] ?? mapWmoDaily(code).replace(/^\w/, (c) => c.toUpperCase()) + " conditions";
}

/** Rough icon id for UI parity with old OpenWeather-style ids */
function wmoToIconId(code: number): string {
  if (code === 0) return "01d";
  if (code <= 3) return "02d";
  if (code >= 45 && code <= 48) return "50d";
  if (code >= 51 && code <= 67) return "10d";
  if (code >= 71 && code <= 77) return "13d";
  if (code >= 95) return "11d";
  return "02d";
}

function mockWeather(city: string): WeatherData {
  const hash = city.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const conditions: WeatherCondition[] = ["sunny", "cloudy", "rainy", "sunny", "cloudy"];
  const condition = conditions[hash % conditions.length];
  const baseTemp = 15 + (hash % 15);
  return {
    temp: baseTemp,
    feelsLike: baseTemp - 2,
    condition,
    description: condition === "sunny" ? "Clear sky" : `${condition} weather`,
    humidity: 40 + (hash % 40),
    windSpeed: 5 + (hash % 15),
    icon: condition === "sunny" ? "01d" : "02d",
    high: baseTemp + 4,
    low: baseTemp - 4,
  };
}

async function fetchCurrentWeatherAtCoords(
  latitude: number,
  longitude: number,
  mockLabel: string
): Promise<WeatherData> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&forecast_days=1&timezone=auto`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return mockWeather(mockLabel);
    const data = (await res.json()) as {
      current?: {
        temperature_2m: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
        apparent_temperature: number;
      };
      daily?: {
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
      };
    };
    const cur = data.current;
    if (!cur) return mockWeather(mockLabel);

    const code = Math.round(cur.weather_code);
    const high = data.daily?.temperature_2m_max?.[0] ?? cur.temperature_2m + 2;
    const low = data.daily?.temperature_2m_min?.[0] ?? cur.temperature_2m - 2;

    return {
      temp: cur.temperature_2m,
      feelsLike: cur.apparent_temperature,
      condition: mapWmoDaily(code),
      description: wmoDescription(code),
      humidity: Math.round(cur.relative_humidity_2m),
      windSpeed: cur.wind_speed_10m,
      icon: wmoToIconId(code),
      high,
      low,
    };
  } catch {
    return mockWeather(mockLabel);
  }
}

/**
 * Current + today's high/low via Open-Meteo (free, no API key).
 */
export async function fetchCurrentWeatherByCity(city: string): Promise<WeatherData> {
  const coords = await geocodeCity(city);
  if (!coords) return mockWeather(city);
  return fetchCurrentWeatherAtCoords(coords.latitude, coords.longitude, city);
}

export async function fetchCurrentWeatherByCoords(lat: number, lng: number): Promise<WeatherData> {
  const base = await fetchCurrentWeatherAtCoords(lat, lng, "your location");
  const locationLabel = await reverseGeocodePlace(lat, lng);
  return locationLabel ? { ...base, locationLabel } : base;
}

async function fetchForecastAtCoords(
  latitude: number,
  longitude: number,
  days: number
): Promise<WeatherData[]> {
  const forecastDays = Math.min(Math.max(1, days), 16);

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&forecast_days=${forecastDays}&timezone=auto`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return mockForecast(days);
    const data = (await res.json()) as {
      daily?: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum?: number[];
      };
    };
    const d = data.daily;
    if (!d?.time?.length || !d.weather_code?.length) return mockForecast(days);

    const forecasts: WeatherData[] = [];
    for (let i = 0; i < Math.min(forecastDays, d.time.length); i++) {
      const code = Math.round(d.weather_code[i] ?? 0);
      const high = d.temperature_2m_max[i] ?? 18;
      const low = d.temperature_2m_min[i] ?? 12;
      const precip = d.precipitation_sum?.[i] ?? 0;
      const condition = precip > 8 ? "rainy" : mapWmoDaily(code);
      const temp = (high + low) / 2;
      forecasts.push({
        temp,
        feelsLike: temp - 1,
        condition,
        description: wmoDescription(code),
        humidity: 55,
        windSpeed: 10,
        icon: wmoToIconId(code),
        high,
        low,
      });
    }
    return forecasts.length ? forecasts : mockForecast(days);
  } catch {
    return mockForecast(days);
  }
}

/**
 * Multi-day forecast via Open-Meteo (free, no API key; up to 16 days).
 */
export async function fetchForecastByCity(city: string, days: number): Promise<WeatherData[]> {
  const coords = await geocodeCity(city);
  if (!coords) return mockForecast(days);
  return fetchForecastAtCoords(coords.latitude, coords.longitude, days);
}

export async function fetchForecastByCoords(
  lat: number,
  lng: number,
  days: number
): Promise<WeatherData[]> {
  return fetchForecastAtCoords(lat, lng, days);
}

function mockForecast(days: number): WeatherData[] {
  const conditions: WeatherCondition[] = [
    "sunny",
    "cloudy",
    "rainy",
    "sunny",
    "cloudy",
    "sunny",
    "rainy",
  ];
  return Array.from({ length: days }, (_, i) => ({
    temp: 18 + Math.floor(Math.random() * 10),
    feelsLike: 16 + Math.floor(Math.random() * 10),
    condition: conditions[i % conditions.length],
    description: `${conditions[i % conditions.length]} weather`,
    humidity: 40 + Math.floor(Math.random() * 40),
    windSpeed: 5 + Math.floor(Math.random() * 15),
    icon: "02d",
    high: 22 + Math.floor(Math.random() * 8),
    low: 12 + Math.floor(Math.random() * 6),
  }));
}

/**
 * Historical weather for a place + calendar date using Open-Meteo archive (no API key).
 */
export async function fetchHistoricalWeather(
  locationQuery: string,
  dateYmd: string
): Promise<WeatherData | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1&language=en&format=json`,
      { next: { revalidate: 86400 } }
    );
    if (!geoRes.ok) return null;
    const geo = (await geoRes.json()) as {
      results?: { latitude: number; longitude: number; name: string }[];
    };
    const hit = geo.results?.[0];
    if (!hit) return null;

    const { latitude, longitude } = hit;
    const archRes = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${dateYmd}&end_date=${dateYmd}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode`,
      { next: { revalidate: 86400 } }
    );
    if (!archRes.ok) return null;
    const arch = (await archRes.json()) as {
      daily?: {
        temperature_2m_max?: (number | null)[];
        temperature_2m_min?: (number | null)[];
        precipitation_sum?: (number | null)[];
        weathercode?: (number | null)[];
      };
    };
    const d = arch.daily;
    if (!d?.temperature_2m_max?.[0] && d?.temperature_2m_max?.[0] !== 0) return null;

    const high = d.temperature_2m_max[0] ?? 15;
    const low = d.temperature_2m_min?.[0] ?? high - 4;
    const code = d.weathercode?.[0] ?? 0;
    const precip = d.precipitation_sum?.[0] ?? 0;
    const condition = precip > 5 ? "rainy" : mapWmoDaily(Math.round(code));
    const temp = (high + low) / 2;

    return {
      temp,
      feelsLike: temp - 1,
      condition,
      description: `Historical (${dateYmd})`,
      humidity: 55,
      windSpeed: 8,
      icon: wmoToIconId(Math.round(code)),
      high,
      low,
    };
  } catch {
    return null;
  }
}
