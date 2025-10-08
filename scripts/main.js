import { loadPage } from './loadPage.js';
import { loadingData } from './loading.js';
import { detectUserLocation } from './location.js';

let units = {
  temperature: "celsius",
  wind: "kmh",
  precip: "mm"
};

loadingData()

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded",() => detectUserLocation(units));

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
    loadPage(city, units);
  }

});

// Открытие и закрытие дропдоуна
document.addEventListener('click', (event) => {
  const dayButton = document.querySelector('.day-select');
  const dayMenu = document.querySelector('.day-dropdown');
  const unitsButton = document.querySelector('.header__units');
  const unitsMenu = document.querySelector('.units-menu');

  if (dayButton && dayButton.contains(event.target)) {
    dayMenu.classList.toggle('show');
  } else if (dayMenu && !dayMenu.contains(event.target)) {
    dayMenu.classList.remove('show');
  }

  if (unitsButton && unitsButton.contains(event.target)) {
    unitsMenu.classList.toggle('show');
  } else if (unitsMenu && !unitsMenu.contains(event.target)) {
    unitsMenu.classList.remove('show');
  }
});
