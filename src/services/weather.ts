import * as Location from 'expo-location';
import { WeatherSnapshot } from '../types';

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    weather_code: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
};

const weatherLabel = (code: number) => {
  if (code === 0) return 'Clear';
  if ([1, 2].includes(code)) return 'Mostly clear';
  if ([3].includes(code)) return 'Cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain';
  if ([71, 73, 75, 77].includes(code)) return 'Snow';
  if ([80, 81, 82].includes(code)) return 'Showers';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Weather unavailable';
};

export const loadWeather = async (): Promise<WeatherSnapshot> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = location.coords;
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&timezone=auto`
  );

  if (!response.ok) {
    throw new Error('Weather request failed');
  }

  const json = (await response.json()) as OpenMeteoResponse;
  const hourly = json.hourly.time.slice(0, 8).map((time, index) => ({
    time,
    temperature: json.hourly.temperature_2m[index],
    code: json.hourly.weather_code[index],
  }));

  return {
    temperature: Math.round(json.current.temperature_2m),
    description: weatherLabel(json.current.weather_code),
    code: json.current.weather_code,
    updatedAt: Date.parse(json.current.time),
    locationLabel: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    hourly,
  };
};
