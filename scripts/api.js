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
// export async function getCurrentWeather(lat, lon) {
//   const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature,relative_humidity_2m,precipitation&timezone=auto`;
  
//   const response = await fetch(url);
//   const data = await response.json();

//   return data.current_weather;
// }
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
