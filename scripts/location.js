import { loadingData } from './loading.js';
import { loadPage } from './loadPage.js';
import { appState } from './appState.js';

export function detectUserLocation(unitsObj) {
  if (!navigator.geolocation) {
    console.log("Geolocation не поддерживается браузером");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const location = {
        name: "Our location",
        latitude,
        longitude,
        country: ""
      };

      console.log("Определено местоположение:", location);

      loadingData();
      loadPage(location, unitsObj); // сразу передаём объект
    },
    (err) => {
      console.log("Пользователь отказал в доступе к геолокации", err);
      loadPage('Suka', unitsObj)
    }
  );
}


