const API_BASE = "/api";

export interface WeatherData {
  lat: number;
  lon: number;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const resp = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
  if (!resp.ok) throw new Error(`Weather fetch failed: ${resp.status}`);
  const data = await resp.json();
  const current = data.current || data.current_weather || {};
  return {
    lat,
    lon,
    temperature: current.temperature_2m ?? current.temperature ?? 0,
    windSpeed: current.wind_speed_10m ?? current.windspeed ?? 0,
    windDirection: current.wind_direction_10m ?? current.winddirection ?? 0,
    humidity: current.relative_humidity_2m ?? 0,
    precipitation: current.precipitation ?? 0,
    weatherCode: current.weather_code ?? current.weathercode ?? 0,
    isDay: current.is_day === 1,
  };
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}
