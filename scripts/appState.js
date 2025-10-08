// Управление состоянием приложения
class AppState {
  constructor() {
    this.currentLocation = null;
    this.units = {
      temperature: "celsius",
      wind: "kmh",
      precip: "mm"
    };
    this.listeners = new Map(); // Для уведомлений об изменениях
  }

  // Установить текущую локацию
  setLocation(location) {
    this.currentLocation = location;
    console.log("Состояние приложения: локация обновлена", location);
    this.notifyListeners('location', location);
  }

  // Получить текущую локацию
  getLocation() {
    return this.currentLocation;
  }

  // Установить единицы измерения
  setUnits(units) {
    this.units = { ...this.units, ...units };
    console.log("Состояние приложения: единицы обновлены", this.units);
    this.notifyListeners('units', this.units);
  }

  // Получить единицы измерения
  getUnits() {
    return this.units;
  }

  // Обновить единицу измерения
  updateUnit(type, value) {
    this.units[type] = value;
    console.log(`Состояние приложения: ${type} = ${value}`, this.units);
    this.notifyListeners('units', this.units);
  }

  // Подписаться на изменения
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Отписаться от изменений
  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Уведомить подписчиков
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Ошибка в обработчике события ${event}:`, error);
        }
      });
    }
  }

  // Сохранить состояние в localStorage
  saveToStorage() {
    const state = {
      location: this.currentLocation,
      units: this.units,
      timestamp: Date.now()
    };
    localStorage.setItem('weatherAppState', JSON.stringify(state));
    console.log("Состояние сохранено в localStorage");
  }

  // Загрузить состояние из localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('weatherAppState');
      if (stored) {
        const state = JSON.parse(stored);
        
        // Проверяем, не устарели ли данные (старше 1 часа)
        const isExpired = Date.now() - state.timestamp > 60 * 60 * 1000;
        
        if (!isExpired && state.location) {
          this.currentLocation = state.location;
          console.log("Состояние загружено из localStorage", this.currentLocation);
        }
        
        if (state.units) {
          this.units = state.units;
          console.log("Единицы загружены из localStorage", this.units);
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки состояния из localStorage:", error);
    }
  }

  // Очистить состояние
  clear() {
    this.currentLocation = null;
    this.units = {
      temperature: "celsius",
      wind: "kmh",
      precip: "mm"
    };
    localStorage.removeItem('weatherAppState');
    console.log("Состояние приложения очищено");
  }
}

// Создаем глобальный экземпляр состояния
export const appState = new AppState();

// Автоматически загружаем состояние при инициализации
appState.loadFromStorage();
