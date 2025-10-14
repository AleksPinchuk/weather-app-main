// Получаем данные с сервера
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

// Простой кэш для API запросов
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Функция для создания ключа кэша
function createCacheKey(url) {
  return url;
}

// Функция для проверки актуальности кэша
function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

// Функция для очистки кэша (вызывается при смене локации)
export function clearApiCache() {
  apiCache.clear();
  console.log("Кэш API очищен");
}

// Получение координат города
export async function getCoordinates(city) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("Город не найден");
    }

    return {
      name: data.results[0].name,
      country: data.results[0].country,
      latitude: data.results[0].latitude.toFixed(6),
      longitude: data.results[0].longitude.toFixed(6),
    };
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to geocoding service');
    }
    throw error;
  }
};

// Получение текущей погоды
export async function getCurrentWeather(lat, lon, unitsObj) {
  // Защита от undefined unitsObj
  if (!unitsObj) {
    throw new Error("unitsObj is required for getCurrentWeather");
  }
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature,relative_humidity_2m,precipitation&temperature_unit=${unitsObj.temperature}&wind_speed_unit=${unitsObj.wind}&precipitation_unit=${unitsObj.precip}&timezone=auto`;

  // Проверяем кэш
  const cacheKey = createCacheKey(url);
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    console.log("Используем кэшированные данные для current weather");
    return processCurrentWeatherData(cachedData.data);
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Сохраняем в кэш
  apiCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });

  return processCurrentWeatherData(data);
}

// Функция для обработки данных текущей погоды
function processCurrentWeatherData(data) {
  if (!data.current_weather) {
    throw new Error("API не вернул current_weather");
  }

  const current = data.current_weather;
  const currentTime = dayjs(current.time);

  // Если hourly нет — возвращаем только current_weather
  if (!data.hourly || !data.hourly.time) {
    console.warn("⚠️ Нет блока hourly в ответе API:", data);
    return {
      ...current,
      feels_like: current.temperature,
      humidity: null,
      precipitation: null,
    };
  }

  const index = data.hourly.time.findIndex((t) =>
    dayjs(t).isSame(currentTime, "hour")
  );

  // Если индекс не найден — просто используем текущие значения
  if (index === -1) {
    console.warn("⚠️ Не найден индекс текущего часа в hourly:", currentTime);
    return {
      ...current,
      feels_like: current.temperature,
      humidity: null,
      precipitation: null,
    };
  }

  return {
    ...current,
    feels_like: data.hourly.apparent_temperature[index],
    humidity: data.hourly.relative_humidity_2m[index],
    precipitation: data.hourly.precipitation[index],
  };
}

// Прогноз на 7 дней
export async function getDailyForecast(lat, lon, unitsObj) {
  // Защита от undefined unitsObj
  if (!unitsObj) {
    throw new Error("unitsObj is required for getDailyForecast");
  }
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=${unitsObj.temperature}&wind_speed_unit=${unitsObj.wind}&precipitation_unit=${unitsObj.precip}&timezone=auto`;

  // Проверяем кэш
  const cacheKey = createCacheKey(url);
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    console.log("Используем кэшированные данные для daily forecast");
    return cachedData.data.daily;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Сохраняем в кэш
  apiCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });

  return data.daily;
}

// Почасовой прогноз
export async function getHourlyForecast(lat, lon, unitsObj) {
  // Защита от undefined unitsObj
  if (!unitsObj) {
    throw new Error("unitsObj is required for getHourlyForecast");
  }
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&temperature_unit=${unitsObj.temperature}&wind_speed_unit=${unitsObj.wind}&precipitation_unit=${unitsObj.precip}&timezone=auto`;

  // Проверяем кэш
  const cacheKey = createCacheKey(url);
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData && isCacheValid(cachedData.timestamp)) {
    console.log("Используем кэшированные данные для hourly forecast");
    return cachedData.data.hourly;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Сохраняем в кэш
  apiCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });

  return data.hourly;
}


// Получаем ссылку на иконку погоды
export function getWeatherImage(weathercode) {
  switch (weathercode) {
    // ☀️ Ясно
    case 0:
      return "assets/images/icon-sunny.webp";

    // 🌤️ Облачно с просветами
    case 1:
    case 2:
      return "assets/images/icon-partly-cloudy.webp";

    // ☁️ Пасмурно
    case 3:
      return "assets/images/icon-overcast.webp";

    // 🌫️ Туман
    case 45:
    case 48:
      return "assets/images/icon-fog.webp";

    // 🌦️ Морось
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "assets/images/icon-drizzle.webp";

    // 🌧️ Дождь
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return "assets/images/icon-rain.webp";


    // ❄️ Снег
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "assets/images/icon-snow.webp";

    // ⛈️ Гроза
    case 95:
    case 96:
    case 99:
      return "assets/images/icon-storm.webp";

    // 🔄 На случай неожиданных значений
    default:
      return "assets/images/icon-overcast.webp";
  }
}

export function getWeatherGradient(weathercode) {
  switch (weathercode) {
    // ☀️ Ясно — тёмно-фиолетовый → золотисто-жёлтый
    case 0:
      return "linear-gradient(180deg, #262540 0%, #FFD54F 100%)";

    // 🌤️ Облачно с просветами — тёмный → тёплый оранжево-жёлтый
    case 1:
    case 2:
      return "linear-gradient(180deg, #262540 0%, #FFB74D 100%)";

    // ☁️ Пасмурно — тёмный → серо-голубой
    case 3:
      return "linear-gradient(180deg, #262540 0%, #90A4AE 100%)";

    // 🌫️ Туман — тёмный → мягкий серо-лиловый
    case 45:
    case 48:
      return "linear-gradient(180deg, #262540 0%, #B0BEC5 100%)";

    // 🌦️ Морось — тёмный → голубовато-бирюзовый
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "linear-gradient(180deg, #262540 0%, #4FC3F7 100%)";

    // 🌧️ Дождь — тёмный → насыщенный сине-бирюзовый
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return "linear-gradient(180deg, #262540 0%, #0288D1 100%)";

    // ❄️ Снег — тёмный → холодный голубовато-белый
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "linear-gradient(180deg, #262540 0%, #E0F7FA 100%)";

    // ⛈️ Гроза — тёмный → фиолетово-синий (с намёком на вспышку)
    case 95:
    case 96:
    case 99:
      return "linear-gradient(180deg, #262540 0%, #7E57C2 100%)";

    // 🔄 Неизвестное состояние — тёмный → нейтрально-серый
    default:
      return "linear-gradient(180deg, #262540 0%, #9E9E9E 100%)";
  }
}
