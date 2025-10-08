// Импорты
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { renderDailyForecast } from './dailyForecast.js';
import { renderHourlyForecast } from './hourlyForecast.js';
import { renderCurrentWeather } from './currentWeather.js';
import { getCoordinates, clearApiCache } from './api.js';
import { appState } from './appState.js';
import { renderDayDropdown } from './dropdown/daysDropdown.js';
import { renderUnitsDropdown } from './dropdown/unitsDropdown.js';

// Хэндлер ошибки (вместо console.log можно выводить сообщение в UI)
function renderError(message) {
  const errorEl = document.querySelector('#error')
  errorEl.textContent = message;
}

// Основная загрузка страницы
export async function loadPage(location, unitsObj, date = dayjs().format('YYYY-MM-DD')) {
  try {
    let locObj;

    // Если передана строка (город) → ищем координаты
    if (typeof location === "string") {
      locObj = await getCoordinates(location);
      if (!locObj) {
        renderError('Город не найден. Попробуйте другой.');
        return;
      }
      // Очищаем кэш при смене локации
      clearApiCache();
    }
    // Если передан объект → используем его напрямую
    else {
      locObj = location;
    }

    console.log(locObj)
    console.log(`Загружаем погоду для: ${locObj.name || "Our location"}`);

    // Обновляем состояние приложения
    appState.setLocation(locObj);
    appState.saveToStorage();

    // Обновляем dropdown с датами
    renderDayDropdown(date, locObj, unitsObj);
    renderUnitsDropdown();

    // Получаем данные о погоде и рендерим
    await Promise.all([
      renderCurrentWeather(locObj, unitsObj),
      renderDailyForecast(locObj, unitsObj),
      renderHourlyForecast(locObj, date, unitsObj),
    ]);
  } catch (error) {
    renderError(`Ошибка загрузки данных: ${error.message || error}`);
  }
}