// Получаем данные с сервера
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

// Получение координат города
export async function getCoordinates(city) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Город не найден");
  }

  return {
    name: data.results[0].name,
    country: data.results[0].country,
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
  };
};

// Получение текущей погоды
export async function getCurrentWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature,relative_humidity_2m,precipitation&timezone=auto`;
  
  const response = await fetch(url);
  const data = await response.json();

  const currentTime = dayjs(data.current_weather.time);

  // Находим индекс ближайшего времени в hourly
  const index = data.hourly.time.findIndex((t) => 
    dayjs(t).isSame(currentTime, "hour")
  );

  return {
    ...data.current_weather,
    feels_like: data.hourly.apparent_temperature[index],
    humidity: data.hourly.relative_humidity_2m[index],
    precipitation: data.hourly.precipitation[index]
  };
}

// Прогноз на 7 дней
export async function getDailyForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  
  const response = await fetch(url);
  const data = await response.json();

  return data.daily;
}

// Почасовой прогноз
export async function getHourlyForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&timezone=auto`;
  
  const response = await fetch(url);
  const data = await response.json();

  return data.hourly;
}

// Получаем ссылку на иконку погоды
export function getWeatherImage(weathercode) {
  switch (weathercode) {
    // ☀️ Ясно
    case 0:
      return "assets/images/icon-sunny.webp";

    // 🌤️ Облачно с просветами
    case 1:
    case 2:
      return "assets/images/icon-partly-cloudy.webp";

    // ☁️ Пасмурно
    case 3:
      return "assets/images/icon-overcast.webp";

    // 🌫️ Туман
    case 45:
    case 48:
      return "assets/images/icon-fog.webp";

    // 🌦️ Морось
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "assets/images/icon-drizzle.webp";

    // 🌧️ Дождь
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return "assets/images/icon-rain.webp";


    // ❄️ Снег
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "assets/images/icon-snow.webp";

    // ⛈️ Гроза
    case 95:
    case 96:
    case 99:
      return "assets/images/icon-storm.webp";

    // 🔄 На случай неожиданных значений
    default:
      return "assets/images/icon-overcast.webp";
  }
}
