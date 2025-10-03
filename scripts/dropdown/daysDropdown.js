import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { loadingHourlyForecast } from '../loading.js';
import { renderHourlyForecast } from '../hourlyForecast.js';

export function renderDayDropdown(selectedDate, location) {
  const dropdown = document.querySelector('.day-dropdown');
  dropdown.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = dayjs().add(i, 'day');
    const li = document.createElement('li');
    li.textContent = date.format('dddd');
    li.classList.add('day');
    li.dataset.date = date.format('YYYY-MM-DD');

    if (li.dataset.date === selectedDate) {
      li.classList.add('active'); // выделяем выбранный день
      document.querySelector('.day-label').textContent = date.format('dddd');
    }

    li.addEventListener('click', () => {
      document.querySelector('.day-dropdown').classList.remove('show');
      
      loadingHourlyForecast(); // показываем "загрузка..."
      renderHourlyForecast(location, li.dataset.date); // грузим с новой датой
    });

    dropdown.appendChild(li);
  }
}

