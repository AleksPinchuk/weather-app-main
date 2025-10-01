// Отбражение загрузки данных
function createEmptyCards(count, className) {
  let result = '';

  for (let i = 0; i < count; i++) {
    result += `<div class="${className}"></div>`;
  }

  return result;
}

export function loadingData () {
  document.querySelector('.hourly-forecast-cards').innerHTML = createEmptyCards(8, 'hourly-forecast-card');
  document.querySelector('.daily-forecast-cards').innerHTML = createEmptyCards(7, 'daily-forecast-card');

  document.querySelector('.day-label').textContent = '-';
  document.querySelectorAll('.indicator__value ').forEach((indicator) => indicator.textContent = '-')

  document.querySelector('.current-weather').classList.add('loading')
}