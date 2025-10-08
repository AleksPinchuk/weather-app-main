import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { getHourlyForecast, getWeatherImage } from './api.js';
import { renderDayDropdown } from './dropdown/daysDropdown.js';

export async function renderHourlyForecast(location, selectedDate, unitsObj) {
  const hourlyForecast = await getHourlyForecast(location.latitude, location.longitude, unitsObj);

  const targetHours = ["03", "06", "09", "12", "15", "18", "21", "00"];

  // Собираем только выбранный день + целевые часы
  const selectedHours = hourlyForecast.time
    .map((time, index) => ({
      time,
      temp: hourlyForecast.temperature_2m[index],
      weatherCode: hourlyForecast.weathercode[index],
    }))
    .filter(({ time }) => {
      const date = dayjs(time).format("YYYY-MM-DD");
      const hour = dayjs(time).format("HH");
      return date === selectedDate && targetHours.includes(hour);
    });

  // Формируем HTML
  let hourlyForecastHTML = "";

  selectedHours.forEach(({ time, temp, weatherCode }) => {
    hourlyForecastHTML += `
      <div class="hourly-forecast-card">
        <img 
          src="${getWeatherImage(weatherCode)}" 
          alt="cloudy" 
          class="forecast-card__icon">
        <p class="forecast-card__time">${dayjs(time).format("HH mm")}</p>
        <p class="forecast-card__temp">${temp.toFixed(0)}°</p>
      </div>
    `;
  });

  document.querySelector('.hourly-forecast-cards').innerHTML = hourlyForecastHTML;
  document.querySelector('.day-label').textContent = dayjs(selectedDate).format('dddd')
  renderDayDropdown(selectedDate, location)
}