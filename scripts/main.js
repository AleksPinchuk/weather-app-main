// Импорты
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { renderDailyForecast } from './dailyForecast.js';
import { renderHourlyForecast } from './hourlyForecast.js';
import { renderCurrentWeather } from './currentWeather.js';
import { getCoordinates } from './api.js';
import { loadingData } from './loading.js';
import { detectUserLocation } from './location.js';

// Хэндлер ошибки (вместо console.log можно выводить сообщение в UI)
function renderError(message) {
  const errorEl = document.querySelector('#error')
  errorEl.textContent = message;
}

// Основная загрузка страницы
async function loadPage(location, date = dayjs().format('YYYY-MM-DD')) {
  try {
    let locObj;

    // Если передана строка (город) → ищем координаты
    if (typeof location === "string") {
      locObj = await getCoordinates(location);
      if (!locObj) {
        renderError('Город не найден. Попробуйте другой.');
        return;
      }
    }
    // Если передан объект → используем его напрямую
    else {
      locObj = location;
    }

    console.log(locObj)
    console.log(`Загружаем погоду для: ${locObj.name || "Our location"}`);

    // Получаем данные о погоде и рендерим
    await Promise.all([
      renderCurrentWeather(locObj),
      renderDailyForecast(locObj),
      renderHourlyForecast(locObj, date)
    ]);

  } catch (error) {
    renderError(`Ошибка загрузки данных: ${error.message || error}`);
  }
}

loadingData()

// 🚀 Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", detectUserLocation(loadPage));

// Обрабатываем ввод данных в форму
document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault(); // чтобы не было перезагрузки страницы
  const inputEl = document.querySelector('#city-input')
  const city = inputEl.value;
  console.log('Ищем погоду в:', city);
  inputEl.value = ''
  // тут показываем что мы загружаем данные
  loadingData()
  loadPage(city);
});


