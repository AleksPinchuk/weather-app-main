// Импорты
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { renderDailyForecast } from './dailyForecast.js';
import { renderHourlyForecast } from './hourlyForecast.js';
import { renderCurrentWeather } from './currentWeather.js';
import { getCoordinates } from './api.js';
import { loadingData } from './loading.js';
import { detectUserLocation } from './location.js';
import { renderDayDropdown } from './dropdown/daysDropdown.js';
import { renderUnitsDropdown } from './dropdown/unitsDropdown.js';

let units = {
  temperature: "celsius",
  wind: "kmh",
  precip: "mm"
};

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

    // Обновляем dropdown с датами
    renderDayDropdown(date, locObj);
    renderUnitsDropdown(units);

    // Получаем данные о погоде и рендерим
    await Promise.all([
      renderCurrentWeather(locObj),
      renderDailyForecast(locObj),
      renderHourlyForecast(locObj, date),
    ]);
  } catch (error) {
    renderError(`Ошибка загрузки данных: ${error.message || error}`);
  }
}

loadingData()

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", detectUserLocation(loadPage));

// Обрабатываем ввод данных в форму
document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault(); // чтобы не было перезагрузки страницы
  const inputEl = document.querySelector('#city-input')
  const city = inputEl.value;

  if (inputEl.value.trim() !== '') {
    console.log('Ищем погоду в:', city);
    inputEl.value = ''
    // тут показываем что мы загружаем данные
    loadingData()
    loadPage(city);
  }

});

// переключение видимости day dropdown
document.addEventListener('click', (event) => {
  const dropdown = document.querySelector('.day-dropdown');
  const button = document.querySelector('.day-select');

  // если клик по кнопке → переключаем меню
  if (button.contains(event.target)) {
    dropdown.classList.toggle('show');
  }
  // если клик вне dropdown → закрываем
  else if (!dropdown.contains(event.target)) {
    dropdown.classList.remove('show');
  }
});

// Открытие / закрытие dropdown
document.addEventListener('click', (event) => {
  const unitsButton = document.querySelector('.header__units');
  const unitsMenu = document.querySelector('.units-menu');

  if (unitsButton.contains(event.target)) {
    unitsMenu.classList.toggle('show');
  } else if (!unitsMenu.contains(event.target)) {
    unitsMenu.classList.remove('show');
  }
});


