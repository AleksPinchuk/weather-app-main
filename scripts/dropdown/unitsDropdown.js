import { loadPage } from "../loadPage.js";

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

export function renderUnitsDropdown(unitsObj, locObj) {
  const unitsToggle = document.querySelector('.units-toggle');

  // Первичная инициализация
  updateToggleText(unitsToggle, unitsObj);
  updateActiveButtons(unitsObj);

  // Обработка клика по переключателю Imperial ↔ Metric
  unitsToggle.addEventListener('click', () => {
    const isMetric = unitsObj.temperature === "celsius";

    unitsObj = isMetric
      ? { temperature: "fahrenheit", wind: "mph", precip: "inch" }
      : { temperature: "celsius", wind: "kmh", precip: "mm" };

    updateToggleText(unitsToggle, unitsObj);
    updateActiveButtons(unitsObj);

    console.log("Текущие единицы:", unitsObj);
    // render/loadPage(unitsObj)
    loadPage(locObj, unitsObj)
  });

  // Обработка клика по отдельным кнопкам внутри групп
  document.querySelectorAll('.units-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.parentElement.dataset.type;
      const value = btn.dataset.value;

      unitsObj[type] = value;
      updateActiveButtons(unitsObj);
      updateToggleText(unitsToggle, unitsObj);

      console.log(`Выбрано: ${type} = ${value}`);
      console.log("Текущие единицы:", unitsObj);
      // render/loadPage(unitsObj)
      loadPage(locObj, unitsObj)
    });
  });
}

