import { loadPage } from "../loadPage.js";
import { appState } from "../appState.js";

// Хранилище для обработчиков событий
let eventHandlersAttached = false;

function updateActiveButtons(unitsObj) {
  document.querySelectorAll('.units-group').forEach(group => {
    const type = group.dataset.type;
    group.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === unitsObj[type]);
    });
  });
}

function updateToggleText(unitsToggle, unitsObj) {
  const isMetric = unitsObj.temperature === "celsius";
  unitsToggle.textContent = isMetric ? "Switch to Imperial" : "Switch to Metric";
}

// Debounce функция для предотвращения частых вызовов API
function debounce(func, wait) {
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

// Создаем debounced версию loadPage
const debouncedLoadPage = debounce(() => {
  const currentLocation = appState.getLocation();
  const currentUnits = appState.getUnits();
  
  if (currentLocation) {
    console.log("Обновляем данные с новыми единицами:", currentUnits);
    console.log("Для локации:", currentLocation.name);
    loadPage(currentLocation, currentUnits);
  } else {
    console.warn("Нет текущей локации для обновления данных");
  }
}, 300); // 300ms задержка

export function renderUnitsDropdown() {
  const unitsToggle = document.querySelector('.units-toggle');
  const currentUnits = appState.getUnits();

  // Первичная инициализация
  updateToggleText(unitsToggle, currentUnits);
  updateActiveButtons(currentUnits);

  // Добавляем обработчики событий только один раз
  if (!eventHandlersAttached) {
    eventHandlersAttached = true;

    // Обработка клика по переключателю Imperial ↔ Metric
    unitsToggle.addEventListener('click', () => {
      const currentUnits = appState.getUnits();
      const isMetric = currentUnits.temperature === "celsius";

      // Обновляем состояние приложения
      if (isMetric) {
        appState.setUnits({
          temperature: "fahrenheit",
          wind: "mph",
          precip: "inch"
        });
      } else {
        appState.setUnits({
          temperature: "celsius",
          wind: "kmh",
          precip: "mm"
        });
      }

      const newUnits = appState.getUnits();
      updateToggleText(unitsToggle, newUnits);
      updateActiveButtons(newUnits);

      console.log("Текущие единицы:", newUnits);
      debouncedLoadPage();
    });

    // Обработка клика по отдельным кнопкам внутри групп
    document.querySelectorAll('.units-group button').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.parentElement.dataset.type;
        const value = btn.dataset.value;

        // Обновляем состояние приложения
        appState.updateUnit(type, value);

        const newUnits = appState.getUnits();
        updateActiveButtons(newUnits);
        updateToggleText(unitsToggle, newUnits);

        console.log(`Выбрано: ${type} = ${value}`);
        console.log("Текущие единицы:", newUnits);
        debouncedLoadPage();
      });
    });
  }
}

