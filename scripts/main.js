// Тут обрабатываем события от пользователя
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { getCoordinates, getCurrentWeather, getDailyForecast, getHourlyForecast } from './api.js'
import { renderDailyForecast } from './dailyForecast.js'
import { renderHourlyForecast } from './hourlyForecast.js'

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

async function renderCurrentWeather(city) {
  try {
    // 1. Ищем координаты города
    const location = await getCoordinates(city);
    console.log(`Город: ${location.name}, ${location.country}`);

    // 2. Текущая погода
    const current = await getCurrentWeather(location.latitude, location.longitude);
    console.log("Текущая погода:", current);

    // Вставляем в разметку
    const placeEl = document.querySelector('.current-weather__city');
    if (placeEl) {
      placeEl.textContent = `${location.name}, ${location.country}`;
    }

    const dateEl = document.querySelector('.current-weather__date')
    if (dateEl) {
      dateEl.textContent = dayjs(current.time).format('dddd, MMM D, YYYY')
    }

    const temperatyreEl = document.querySelector('.current-weather__temp')
    if (temperatyreEl) {
      temperatyreEl.textContent = `${current.temperature.toFixed(0)}°`
    }

    const weatherImageEl = document.querySelector('.current-weather-image')
    if (weatherImageEl) {
      weatherImageEl.src = getWeatherImage(current.weathercode)
    }

    const feelsLikeEl = document.querySelector('.feels_like')
    if (feelsLikeEl) {
      feelsLikeEl.textContent = `${current.feels_like.toFixed(0)}°`
    }

    const humidityEl = document.querySelector('.humidity')
    if (humidityEl) {
      humidityEl.textContent = `${current.humidity}%`
    }

    const windEl = document.querySelector('.wind')
    if (windEl) {
      windEl.textContent = `${current.windspeed.toFixed(0)} km/h`
    }

    const preciptionEl = document.querySelector('.precipitation')
    if (preciptionEl) {
      preciptionEl.textContent = `${current.precipitation} mm`
    }


    return { location, current };
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}

// Нужно будет связать инпунт и рендер погоды
renderCurrentWeather("Moscow").then(({ location, current }) => {
  console.log("Локация:", location);
  console.log("Погода:", current);
  renderDailyForecast(location)
});

