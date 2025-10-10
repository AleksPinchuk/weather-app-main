import { loadPage } from './loadPage.js';
import { loadingData } from './loading.js';
import { detectUserLocation } from './location.js';
import { appState } from './appState.js';
import { initSearchDropdown } from './dropdown/searchDropdown.js';

loadingData()

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded",() => {
  // Инициализируем search dropdown
  initSearchDropdown();
  
  // Проверяем, есть ли сохраненная локация
  const savedLocation = appState.getLocation();
  
  if (savedLocation) {
    console.log("Восстанавливаем сохраненную локацию:", savedLocation);
    loadingData();
    loadPage(savedLocation, appState.getUnits());
  } else {
    // Если нет сохраненной локации, определяем местоположение пользователя
    detectUserLocation(appState.getUnits());
  }
});

// Обработка формы теперь происходит в searchDropdown.js

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
