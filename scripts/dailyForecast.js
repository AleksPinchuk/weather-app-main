import { getDailyForecast, getWeatherImage, getWeatherGradient} from './api.js'
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { $ } from './utils.js';

export async function renderDailyForecast(location, unitsObj) {

  const dailyForecast = await getDailyForecast(location.latitude, location.longitude, unitsObj)

  let dailyForecastHTML = "";

  console.log(dailyForecast)

  dailyForecast.time.forEach((date, index) => {
    const maxTemp = dailyForecast.temperature_2m_max[index].toFixed(0);
    const minTemp = dailyForecast.temperature_2m_min[index].toFixed(0);
    const weatherCode = dailyForecast.weathercode[index];

    dailyForecastHTML += `
                <div class="daily-forecast-card"
                style="background: ${getWeatherGradient(weatherCode)}">
              <p class="forecast-card__day">${dayjs(date).format('ddd')}</p>
              <img
                src="${getWeatherImage(weatherCode)}"
                alt="rain"
                class="forecast-card__icon"
              />
              <div class="forecast-card-temperature">
                <p class="forecast-card__temp">${maxTemp}°</p>
                <p class="forecast-card__temp-feel">${minTemp}°</p>
              </div>
            </div>
    `

    $('.daily-forecast-cards').innerHTML = dailyForecastHTML;
  })
}

