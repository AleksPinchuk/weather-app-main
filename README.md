# 🌤 Weather App

This project is a responsive **weather forecast web application** built as a solution to the [Frontend Mentor Weather App challenge](https://www.frontendmentor.io/challenges/weather-app-K1FhddVm49).
It allows users to search for a city, view detailed current weather conditions, and explore daily and hourly forecasts powered by the [Open-Meteo API](https://open-meteo.com/).

## Table of contents

- [Overview](#overview)
  - [Features](#features)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [Built with](#built-with)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [What I Learned](#what-i-learned)
- [Author](#author)

## Overview

### Features

Users should be able to:

- Search for weather information by entering a location in the search bar
- View current weather conditions including temperature, weather icon, and location details
- See additional weather metrics like "feels like" temperature, humidity percentage, wind speed, and precipitation amounts
- Browse a 7-day weather forecast with daily high/low temperatures and weather icons
- View an hourly forecast showing temperature changes throughout the day
- Switch between different days of the week using the day selector in the hourly forecast sectionС
- Toggle between Imperial and Metric measurement units via the units dropdown 
- Switch between specific temperature units (Celsius and Fahrenheit) and measurement units for wind speed (km/h and mph) and precipitation (millimeters) via the units dropdown
- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page

### Screenshot

![Design preview for the Weather app coding challenge](./preview.jpg)

### Links

* **Live Site:** [Weather App](https://alekspinchuk.github.io/weather-app/)
* **Repository:** [Weather App Github](https://github.com/AleksPinchuk/weather-app-main)


### Built with

* **HTML5** — semantic structure
* **SCSS (CSS)** — modular and responsive styles
* **JavaScript (ES Modules)** — for app logic and data flow
* **Open-Meteo API** — weather data source
* **Day.js** — for date formatting and calculations
* **Fetch API** — for async API calls


## Architecture

The application is structured around modular JavaScript files:

```
src/scripts
├── api.js              # Fetches weather and location data
├── main.js             # Main entry, handles user input and dropdowns
├── appState.js         # Stores key application data
├── loadPage.js         # Main function that renders the app
├── dropdown/
│   ├── daysDropdown.js     # Renders day selection dropdown
│   └── unitsDropdown.js    # Renders units selection dropdown
│   └── searchDropdown.js   # Renders search dropdown
│
├── currentWeather.js   # Displays current weather
├── dailyForecast.js    # Displays 7-day forecast
├── hourlyForecast.js   # Displays hourly forecast
├── location.js         # Function for getting user location
└── utils.js            # debounce for API requests, $ and $$ helper functions for DOM queries
```

### Data Fetching

Data is fetched from **Open-Meteo API**:

```js
const url = `https://api.open-meteo.com/v1/forecast?
  latitude=${lat}&longitude=${lon}
  &hourly=temperature_2m,weathercode
  &temperature_unit=${units.temperature}
  &wind_speed_unit=${units.wind}
  &precipitation_unit=${units.precip}
  &timezone=auto`;
```

### Rendering

All rendering functions (`renderCurrentWeather`, `renderDailyForecast`, `renderHourlyForecast`) are **asynchronous** and are called from `loadPage()`.
The UI updates instantly when:

* A new city is selected
* The user switches units
* A different day is chosen

---

## How It Works

1. On page load, the app tries to **detect the user’s location** or uses a default one.
2. The `loadPage()` function fetches data and renders:
   * Current weather
   * Daily forecast
   * Hourly forecast
3. Dropdowns allow users to change **units** and **selected date**, automatically triggering data reload.
4. The app reuses `appState` and updates UI efficiently without reloading the entire page.

---

## What I Learned

During this project, I:

* Improved understanding of **modular JavaScript architecture**
* Learned to structure a small app without frameworks using ES modules
* Practiced **working with external APIs (Open-Meteo)**
* Implemented dropdown menus with **click-outside closing**
* Learned how to manage a **shared app state** between components

Example of modular function structure:

```js
export function renderUnitsDropdown() {
  const toggle = document.querySelector('.units-toggle');
  const currentUnits = appState.getUnits();

  // Initial UI setup
  toggle.textContent = currentUnits.temperature === "celsius"
    ? "Switch to Imperial"
    : "Switch to Metric";

  // Toggle between Metric ↔ Imperial
  toggle.addEventListener('click', () => {
    const isMetric = appState.getUnits().temperature === "celsius";

    appState.setUnits(
      isMetric
        ? { temperature: "fahrenheit", wind: "mph", precip: "inch" }
        : { temperature: "celsius", wind: "kmh", precip: "mm" }
    );

    // Update UI text
    toggle.textContent = isMetric ? "Switch to Metric" : "Switch to Imperial";

    // Reload data with debounce (300ms)
    debounce(() => loadPage(appState.getLocation(), appState.getUnits()), 300)();
  });
}
```

## Author

* **Name:** Aleksandr Pinchuk
* **GitHub:** [@AleksPinchuk](https://github.com/AleksPinchuk)

