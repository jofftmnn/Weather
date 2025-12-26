const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const humidityEl = document.getElementById("humidity");
const forecastEl = document.getElementById("forecast");

const API_KEY = "9b4b339006520dffd92c03351f1701f7";
const DEFAULT_CITY = "Manila,PH";


searchBtn.onclick = () => {
  if (cityInput.value.trim()) {
    loadCity(cityInput.value.trim());
    cityInput.value = "";
  }
};


locBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    loadCoords(pos.coords.latitude, pos.coords.longitude);
  });
};

async function loadCity(city) {
  try {
    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherRes.ok) throw new Error(weatherData.message);

    renderCurrent(weatherData);
    loadForecast(`q=${city}`);
  } catch (err) {
    descEl.textContent = "Unable to load weather";
    console.error(err);
  }
}


async function loadCoords(lat, lon) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const data = await fetch(url).then(r => r.json());
  renderCurrent(data);
  loadForecast(`lat=${lat}&lon=${lon}`);
}


async function loadForecast(query) {
  const url =
    `https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${API_KEY}&units=metric`;
  const data = await fetch(url).then(r => r.json());
  renderForecast(data.list);
}


function renderCurrent(data) {
  cityEl.textContent = `${data.name}, ${data.sys.country}`;
  tempEl.textContent = `${Math.round(data.main.temp)}°`;
  descEl.textContent = data.weather[0].description;
  humidityEl.textContent = `💧 ${data.main.humidity}%`;
}


function renderForecast(list) {
  forecastEl.innerHTML = "";
  const days = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date] && item.dt_txt.includes("12:00")) {
      days[date] = item;
    }
  });

  Object.values(days).slice(0, 5).forEach(item => {
    const d = new Date(item.dt_txt);
    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `
      <div class="name">${d.toLocaleDateString(undefined,{weekday:"short"})}</div>
      <div class="icon">${icon(item.weather[0].id)}</div>
      <div class="temp">${Math.round(item.main.temp)}°</div>
    `;
    forecastEl.appendChild(div);
  });
}


function icon(id) {
  if (id < 300) return "⛈️";
  if (id < 600) return "🌧️";
  if (id < 700) return "❄️";
  if (id < 800) return "🌫️";
  if (id === 800) return "☀️";
  return "☁️";
}


loadCity(DEFAULT_CITY);