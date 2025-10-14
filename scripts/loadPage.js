// Импорты
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { renderDailyForecast } from './dailyForecast.js';
import { renderHourlyForecast } from './hourlyForecast.js';
import { renderCurrentWeather } from './currentWeather.js';
import { getCoordinates, clearApiCache } from './api.js';
import { appState } from './appState.js';
import { renderDayDropdown } from './dropdown/daysDropdown.js';
import { renderUnitsDropdown } from './dropdown/unitsDropdown.js';
import { $ } from './utils.js';


// Очистка всех ошибок и восстановление интерфейса
export function clearErrors() {
  const errorEl = $('#error');
  const apiErrorEl = $('.api-error');

  if (errorEl) errorEl.textContent = '';
  if (apiErrorEl) {
    apiErrorEl.innerHTML = '';
    apiErrorEl.classList.remove('show');
  }

  $('.weather-grid')?.classList.remove('hide');
  $('.main')?.classList.remove('hide');
  $('.footer')?.classList.remove('hide');
}

// Показ ошибки поиска города
export function renderError(message = 'No search result found!') {
  clearErrors();

  const errorEl = $('#error');
  if (errorEl) {
    errorEl.textContent = message;
  }

  $('.weather-grid')?.classList.add('hide');
  $('.footer')?.classList.add('hide');
}

// Показ ошибки API
export function renderApiError(errorMessage = 'Something went wrong') {
  clearErrors();

  const apiErrorEl = $('.api-error');
  if (!apiErrorEl) return;

  apiErrorEl.classList.add('show');

  const errorHTML = `
      <img src="./assets/images/icon-error.svg" alt="Error" class="error-image"/>
      <h3>Something went wrong</h3>
      <p>We couldn't connect to the server (API error). Please try again in a few moments. ${errorMessage}</p>
      <button class="retry-button">
        <img src="./assets/images/icon-retry.svg" alt="Retry" />
        Retry
      </button>`;

  apiErrorEl.innerHTML = errorHTML;

  $('.main')?.classList.add('hide');
  $('.footer')?.classList.add('hide');

  // Добавляем обработчик для кнопки Retry
  const retryButton = $('.retry-button');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      const currentLocation = appState.getLocation();
      const currentUnits = appState.getUnits();

      if (currentLocation) {
        // Если локация уже есть, просто загружаем данные
        loadPage(currentLocation, currentUnits);
      } else {
        // Пытаемся получить геолокацию один раз
        import('./location.js').then(({ detectUserLocation }) => {
          detectUserLocation(currentUnits, (success) => {
            if (success) {
              console.log("Геолокация получена, страница загружена");
            } else {
              // Если геолокацию получить не удалось — показываем ручной поиск города
              renderError("Location access denied. You can search for the city you want manually.");
            }
          });
        });
      }
    });
  }
}

// Основная загрузка страницы
export async function loadPage(location, unitsObj, date = dayjs().format('YYYY-MM-DD')) {
  try {
    // Очищаем предыдущие ошибки
    clearErrors();

    let locObj;

    // Если передана строка (город) → ищем координаты
    if (typeof location === "string") {
      try {
        locObj = await getCoordinates(location);
        if (!locObj) {
          renderError(`City "${location}" not found. Please try another city.`);
          return;
        }
        // Очищаем кэш при смене локации
        clearApiCache();
      } catch (error) {
        // Ошибка при поиске координат города
        if (error.message === "Город не найден") {
          renderError(`City "${location}" not found. Please try another city.`);
        } else {
          renderApiError(`Failed to search for city: ${error.message}`);
        }
        return;
      }
    }
    // Если передан объект → используем его напрямую
    else {
      locObj = location;
    }

    console.log(locObj);
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
    console.error('Ошибка загрузки данных:', error);

    // Определяем тип ошибки
    if (error.message?.includes('API не вернул') ||
      error.message?.includes('unitsObj is required') ||
      error.message?.includes('Failed to fetch')) {
      renderApiError(`API Error: ${error.message}`);
    } else {
      renderApiError(`Unexpected error: ${error.message || error}`);
    }
  }
}