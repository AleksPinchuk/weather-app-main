// Утилиты для приложения
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// DOM утилиты
export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}

// Создание пустых карточек для загрузки
export function createEmptyCards(count, className) {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += `<div class="${className}"></div>`;
  }
  return result;
}
