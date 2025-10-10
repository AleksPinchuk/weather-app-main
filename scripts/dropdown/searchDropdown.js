import { loadPage } from '../loadPage.js';
import { loadingData } from '../loading.js';
import { appState } from '../appState.js';
import { debounce, $, $$ } from '../utils.js';

const input = $('#city-input');
const form = $('#search-form');
const dropdown = $('.search-dropdown');

const HISTORY_KEY = 'recentCities';

// Debounce функция теперь импортируется из utils.js

// Сохраняем город в историю (не более 4)
function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  // Удаляем дубликаты и добавляем в начало
  history = [city, ...history.filter(c => c !== city)].slice(0, 4);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  console.log('Сохранено в историю:', city);
}

// Получаем историю поисков
function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

// Показываем/скрываем dropdown
function showDropdown() {
  dropdown.classList.add('show');
}

function hideDropdown() {
  dropdown.classList.remove('show');
}

// Рендерим dropdown с элементами
function renderDropdown(items, isHistory = false) {
  dropdown.innerHTML = '';
  currentItems = items.slice(0, 4); // Всегда максимум 4 элемента
  selectedIndex = -1;
  
  if (currentItems.length === 0) {
    hideDropdown();
    return;
  }

  // Получаем текущий город из состояния приложения
  const currentLocation = appState.getLocation();
  const currentCityName = currentLocation ? `${currentLocation.name}, ${currentLocation.country}` : null;

  currentItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'search-dropdown__item';
    
    // Добавляем класс active для текущего города
    if (currentCityName && item === currentCityName) {
      li.classList.add('active');
    }
    
    li.textContent = item;
    li.dataset.index = index;
    
    li.addEventListener('click', () => {
      selectCity(item);
    });

    // Добавляем эффект hover
    li.addEventListener('mouseenter', () => {
      selectedIndex = index;
      updateSelection();
    });
    
    li.addEventListener('mouseleave', () => {
      // Не сбрасываем selectedIndex при mouseleave
    });

    dropdown.appendChild(li);
  });

  showDropdown();
}

// Обновляем выделение элемента
function updateSelection() {
  const items = dropdown.querySelectorAll('.search-dropdown__item');
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
      // НЕ удаляем класс 'active' - он должен оставаться для текущего города
    }
  });
}

// Автодополнение из API open-meteo
async function fetchSuggestions(query) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=4&language=en&format=json`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`API Error: HTTP ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    
    if (!data.results) return [];
    
    return data.results.map(r => `${r.name}, ${r.country}`);
  } catch (error) {
    console.error('Ошибка получения предложений:', error);
    // Не показываем ошибку пользователю для автодополнения - просто возвращаем пустой массив
    return [];
  }
}

// Выбираем город из dropdown
function selectCity(city) {
  input.value = ''; // Очищаем поле после выбора
  hideDropdown();
  searchCity(city);
}

// Очищаем поле поиска
function clearSearch() {
  input.value = '';
  hideDropdown();
  input.focus();
}

// Выполняем поиск города
function searchCity(city) {
  if (!city.trim()) return;
  
  console.log('Ищем погоду для:', city);
  saveToHistory(city);
  input.value = ''; // Очищаем поле после поиска
  hideDropdown(); // Скрываем dropdown
  loadingData();
  loadPage(city, appState.getUnits());
}

// Debounced функция для обработки ввода
const debouncedSearch = debounce(async (value) => {
  if (!value.trim()) {
    renderDropdown(getHistory(), true); // пустой инпут → показываем историю
    return;
  }

  const suggestions = await fetchSuggestions(value);
  renderDropdown(suggestions, false);
}, 300); // 300ms задержка

// Переменные для клавиатурной навигации
let selectedIndex = -1;
let currentItems = [];

// Инициализация search dropdown
export function initSearchDropdown() {
  // Обработка ввода в поле поиска
  input.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  // При фокусе на пустом поле показываем историю
  input.addEventListener('focus', () => {
    if (!input.value.trim()) {
      renderDropdown(getHistory(), true);
    }
  });

  // Скрываем dropdown при клике вне его
  document.addEventListener('click', (event) => {
    if (!input.contains(event.target) && !dropdown.contains(event.target)) {
      hideDropdown();
    }
  });

  // Обработка отправки формы
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (!city) return;
    
    hideDropdown();
    searchCity(city);
  });

  // Обработка клавиш (Enter, Escape, Arrow keys)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideDropdown();
      return;
    }

    if (!dropdown.classList.contains('show') || currentItems.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
        updateSelection();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection();
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentItems.length) {
          selectCity(currentItems[selectedIndex]);
        } else if (input.value.trim()) {
          // Если ничего не выбрано, но есть текст в поле
          const city = input.value.trim();
          searchCity(city);
        }
        break;
    }
  });

  // Подписываемся на изменения локации для обновления active класса
  appState.subscribe('location', () => {
    // Если dropdown открыт, обновляем его для отображения нового active элемента
    if (dropdown.classList.contains('show')) {
      const currentValue = input.value.trim();
      if (!currentValue) {
        // Если поле пустое, показываем историю с обновленным active
        renderDropdown(getHistory(), true);
      }
    }
  });

  console.log('Search dropdown инициализирован');
}
