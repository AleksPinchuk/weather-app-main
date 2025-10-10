import { getCurrentWeather, getWeatherImage } from './api.js'
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { $ } from './utils.js';

export async function renderCurrentWeather(location, unitsObj) {
  try {
    //Текущая погода
    const current = await getCurrentWeather(location.latitude, location.longitude, unitsObj);
    console.log("Текущая погода:", current);

    $('.current-weather').classList.remove('loading')

    // Вставляем в разметку
    const placeEl = $('.current-weather__city');
    if (placeEl) {
      placeEl.textContent = !location.country ? `${location.name}` : `${location.name}, ${location.country}`;
    }

    const dateEl = $('.current-weather__date')
    if (dateEl) {
      dateEl.textContent = dayjs(current.time).format('dddd, MMM D, YYYY')
    }

    const temperatyreEl = $('.current-weather__temp')
    if (temperatyreEl) {
      temperatyreEl.textContent = `${current.temperature.toFixed(0)}°`
    }

    const weatherImageEl = $('.current-weather-image')
    if (weatherImageEl) {
      weatherImageEl.src = getWeatherImage(current.weathercode)
    }

    const feelsLikeEl = $('.feels_like')
    if (feelsLikeEl) {
      feelsLikeEl.textContent = `${current.feels_like.toFixed(0)}°`
    }

    const humidityEl = $('.humidity')
    if (humidityEl) {
      humidityEl.textContent = `${current.humidity}%`
    }

    const windEl = $('.wind')
    if (windEl) {
      windEl.textContent = `${current.windspeed.toFixed(0)} ${unitsObj.wind === 'kmh'? 'km/h' : 'mph'}`
    }

    const preciptionEl = $('.precipitation')
    if (preciptionEl) {
      preciptionEl.textContent = `${current.precipitation} ${unitsObj.precip}`
    }


    return { location, current };
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}