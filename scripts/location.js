import { loadingData } from './loading.js';
import { loadPage, renderApiError } from './loadPage.js';

export function detectUserLocation(unitsObj, callback) {
  if (!navigator.geolocation) {
    console.log("Geolocation не поддерживается браузером");
    if (callback) callback(false); // говорим, что геолокацию получить не удалось
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        name: "Our location",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        country: ""
      };

      console.log("Определено местоположение:", location);
      loadingData();
      loadPage(location, unitsObj);

      if (callback) callback(true); // геолокация успешна
    },
    (err) => {
      console.log("Пользователь отказал в доступе к геолокации", err);
      renderApiError(`Geolocation error: ${err.message || 'Location access denied'}`);
      if (callback) callback(false); // геолокацию получить не удалось
    }
  );
}
