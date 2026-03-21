import { WeatherData, WeatherCondition } from "./types";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

function mapCondition(id: number): WeatherCondition {
  if (id >= 200 && id < 300) return "stormy";
  if (id >= 300 && id < 400) return "rainy";
  if (id >= 500 && id < 600) return "rainy";
  if (id >= 600 && id < 700) return "snowy";
  if (id >= 700 && id < 800) return "foggy";
  if (id === 800) return "sunny";
  return "cloudy";
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  if (!API_KEY) return getMockWeather(city);

  try {
    const res = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );
    if (!res.ok) return getMockWeather(city);
    const data = await res.json();

    return {
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      condition: mapCondition(data.weather[0].id),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
      high: data.main.temp_max,
      low: data.main.temp_min,
    };
  } catch {
    return getMockWeather(city);
  }
}

export async function getForecast(
  city: string,
  days: number
): Promise<WeatherData[]> {
  if (!API_KEY) return getMockForecast(days);

  try {
    const res = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );
    if (!res.ok) return getMockForecast(days);
    const data = await res.json();

    const dailyMap = new Map<string, typeof data.list>();
    for (const entry of data.list) {
      const day = entry.dt_txt.split(" ")[0];
      if (!dailyMap.has(day)) dailyMap.set(day, []);
      dailyMap.get(day)!.push(entry);
    }

    const forecasts: WeatherData[] = [];
    for (const [, entries] of dailyMap) {
      if (forecasts.length >= days) break;
      const mid = entries[Math.floor(entries.length / 2)];
      const temps = entries.map((e: { main: { temp: number } }) => e.main.temp);
      forecasts.push({
        temp: mid.main.temp,
        feelsLike: mid.main.feels_like,
        condition: mapCondition(mid.weather[0].id),
        description: mid.weather[0].description,
        humidity: mid.main.humidity,
        windSpeed: mid.wind.speed,
        icon: mid.weather[0].icon,
        high: Math.max(...temps),
        low: Math.min(...temps),
      });
    }

    return forecasts;
  } catch {
    return getMockForecast(days);
  }
}

function getMockWeather(city: string): WeatherData {
  const hash = city.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const conditions: WeatherCondition[] = [
    "sunny",
    "cloudy",
    "rainy",
    "sunny",
    "cloudy",
  ];
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

function getMockForecast(days: number): WeatherData[] {
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
