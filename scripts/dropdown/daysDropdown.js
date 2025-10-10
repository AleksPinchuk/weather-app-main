import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { loadingHourlyForecast } from '../loading.js';
import { renderHourlyForecast } from '../hourlyForecast.js';
import { $ } from '../utils.js';

export function renderDayDropdown(selectedDate, location, unitsObj) {
  const dropdown = $('.day-dropdown');
  dropdown.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = dayjs().add(i, 'day');
    const li = document.createElement('li');
    li.textContent = date.format('dddd');
    li.classList.add('day');
    li.dataset.date = date.format('YYYY-MM-DD');

    if (li.dataset.date === selectedDate) {
      li.classList.add('active'); // выделяем выбранный день
      $('.day-label').textContent = date.format('dddd');
    }

    li.addEventListener('click', () => {
      $('.day-dropdown').classList.remove('show');
      
      loadingHourlyForecast(); // показываем "загрузка..."
      renderHourlyForecast(location, li.dataset.date, unitsObj); // грузим с новой датой
    });

    dropdown.appendChild(li);
  }
}

