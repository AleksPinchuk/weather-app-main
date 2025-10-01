// Импорты
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { renderDailyForecast } from './dailyForecast.js';
import { renderHourlyForecast } from './hourlyForecast.js';
import { renderCurrentWeather } from './currentWeather.js';
import { getCoordinates } from './api.js';
import { loadingData } from './loading.js';

// Хэндлер ошибки (вместо console.log можно выводить сообщение в UI)
function renderError(message) {
  const errorEl = document.querySelector('#error') 
  errorEl.textContent = message;
}

// Основная загрузка страницы
async function loadPage(city, date = dayjs().format('YYYY-MM-DD')) {
  try {
    // Получаем координаты
    const location = await getCoordinates(city);

    if (!location) {
      renderError('Город не найден. Попробуйте другой.');
      return;
    }

    console.log(`Город: ${location.name}, ${location.country}`);

    // Получаем данные о погоде и рендерим
    await Promise.all([
      renderCurrentWeather(location),
      renderDailyForecast(location),
      renderHourlyForecast(location, date)
    ]);

  } catch (error) {
    renderError(`Ошибка загрузки данных: ${error.message || error}`);
  }
}

// Обрабатываем ввод данных в форму
document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault(); // чтобы не было перезагрузки страницы
  const inputEl = document.querySelector('#city-input')
  const city = inputEl.value;
  console.log('Ищем погоду в:', city);
  inputEl.value = ''
  loadPage(city);
});

