import { loadingData } from './loading.js';

export function detectUserLocation(fun) {
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
      fun(location); // сразу передаём объект
    },
    (err) => {
      console.log("Пользователь отказал в доступе к геолокации", err);
      fun('Suka')
    }
  );
}


