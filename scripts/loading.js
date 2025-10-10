import { createEmptyCards, $, $$ } from './utils.js';

// Отображение загрузки данных
export function loadingData() {
  $('.hourly-forecast-cards').innerHTML = createEmptyCards(8, 'hourly-forecast-card');
  $('.daily-forecast-cards').innerHTML = createEmptyCards(7, 'daily-forecast-card');

  $('.day-label').textContent = '-';
  $$('.indicator__value').forEach((indicator) => indicator.textContent = '-');

  $('.current-weather').classList.add('loading');
}

export function loadingHourlyForecast() {
  $('.hourly-forecast-cards').innerHTML = createEmptyCards(8, 'hourly-forecast-card');
  $('.day-label').textContent = '-';
}