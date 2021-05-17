/**
 * handle fetch error: https://stackoverflow.com/questions/38235715/fetch-reject-promise-and-catch-the-error-if-status-is-not-ok
 */

let state = [];

const replay_btn = document.getElementById("replay_btn");
// const kerala_btn = document.getElementById("kerala_btn");

const precipitation_cBox = document.getElementById("precipitation_cBox");
const clouds_cBox = document.getElementById("clouds_cBox");
const temp_cBox = document.getElementById("temp_cBox");

const card = document.getElementById("card");
const zoom = 4;

// replay_btn.disabled = true;

//  card.style.display = "none";
const map = L.map("map", { zoomControl: false });

const mapTileURL =
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

L.tileLayer(mapTileURL, {
  attribution: mapTileAttribution,
  maxZoom: 18,
  minZoom: 1,
  id: "mapbox/streets-v11",
  tileSize: 512,
  zoomOffset: -1,
  edgeBufferTiles: 1,
  accessToken:
    "pk.eyJ1IjoidmFydW5iIiwiYSI6ImNrbmZqYnQwMDJ2ZTUycXA5Y2Zya2QzM3gifQ.r7iv0_XbuD2Y8fzN0BmY8A",
}).addTo(map);

const format_UTC_local = (sec, compressed) => {
  const date = new Date(sec * 1000);
  const day = date.getDay();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const time = hours > 12 ? `${hours - 12}` : `${hours}`;
  const ampm = hours > 12 ? "pm" : "am";
  if (compressed) {
    return `${date.getDate()}, ${weekDays[day]}`;
  } else {
    return `${date.getDate()}, ${weekDays[day]} ${time}:${minutes} ${ampm}`;
  }
};

function update_header(
  icon,
  temp,
  feels_like,
  humidity,
  wind_speed,
  dt,
  main,
  description,
  city
) {
  const city_name = document.getElementById("city");
  const date_time = document.getElementById("date_time");
  const main_el = document.getElementById("main");
  const description_el = document.getElementById("description");
  const icon_main = document.getElementById("icon_main");
  const temp_main = document.getElementById("temp_main");
  const temp_feels = document.getElementById("temp_feels");
  const humidity_el = document.getElementById("humidity");
  const wind = document.getElementById("wind");

  city_name.textContent = city;
  date_time.textContent = format_UTC_local(dt, false);
  main_el.textContent = main;
  description_el.textContent = description;
  icon_main.src = `/icons/${icon}@2x.png`;
  temp_main.textContent = parseInt(temp);
  temp_feels.textContent = parseInt(feels_like);
  humidity_el.textContent = humidity;
  wind.textContent = parseInt(parseFloat(wind_speed) * 3.6);
}
const updateUI = (district) => {
  const { city, current, daily, alert } = district;

  update_header(
    current.weather[0].icon,
    current.temp,
    current.feels_like,
    current.humidity,
    current.wind_speed,
    current.dt,
    current.weather[0].main,
    current.weather[0].description,
    city
  );

  if (alert) {
    console.log(alert);
  } else {
    console.log("No alerts!");
  }

  const card_footer = document.getElementById("card_footer");
  while (card_footer.firstChild) {
    card_footer.removeChild(card_footer.firstChild);
  }
  for (day of daily) {
    const date_time = format_UTC_local(day.dt, true);
    const footer_icon = day.weather[0].icon;
    const max_temp = parseInt(day.temp.max);

    const span = document.createElement("span");
    span.className = "footer_sub_wrapper";
    const small_date = document.createElement("small");
    small_date.textContent = `${date_time}`;
    const img = document.createElement("img");
    img.src = `/icons/${footer_icon}@2x.png`;
    const small_temp = document.createElement("span");
    small_temp.textContent = `${max_temp}`;
    const sup = document.createElement("sup");
    sup.textContent = "°C";
    small_temp.append(sup);
    span.append(small_date);
    span.append(img);
    span.append(small_temp);
    card_footer.append(span);
  }
};

const letsFly = async () => {
  const response = await fetch("/api");

  // only in a true case we need to proceed further.
  if (response.ok) {
    return response;
  } else {
    throw new Error("Response from fetch request: ", response.ok);
  }
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
const marker = L.marker();

// letsFly()
//   .then(async (response) => {
//     state = await response.json();

//     for (district of state) {
//       replay_btn.disabled = true;
//       // console.log(district);
//       const { lat, lon } = district;
//       document.getElementById("overlay").style.display = "none";

//       map.setView([lat, lon], 8, {
//         animate: true,
//         pan: {
//           duration: 3,
//         },
//       });

//       marker.setLatLng([lat, lon]).addTo(map);
//       updateUI(district);
//       card.style.display = "block";

//       await sleep(4000);
//     }
//     replay_btn.disabled = false;
//   })
//   .catch((error) => {
//     console.log(error);
//   });

async function replay() {
  // console.log(state);

  for (district of state) {
    replay_btn.disabled = true;
    // console.log(district);
    const { lat, lon } = district;
    document.getElementById("overlay").style.display = "none";

    map.setView([lat, lon], 10, {
      animate: true,
      pan: {
        duration: 2,
      },
    });

    marker.setLatLng([lat, lon]).addTo(map);
    updateUI(district);
    card.style.display = "block";
    await sleep(4000);
  }
  replay_btn.disabled = false;
}
async function weather_updates_kerala() {
  // kerala_btn.disabled = true;
  document.getElementById("overlay").style.display = "block";
  if (state.length > 1) {
    console.log(state);
  } else {
    const response = await letsFly();
    state = await response.json();
  }
  document.getElementById("overlay").style.display = "none";
  for (district of state) {
    replay_btn.disabled = true;
    // console.log(district);
    const { lat, lon } = district;
    // document.getElementById("overlay").style.display = "none";

    map.setView([lat, lon], 8, {
      animate: true,
      pan: {
        duration: 3,
      },
    });

    marker.setLatLng([lat, lon]).addTo(map);
    updateUI(district);
    card.style.display = "block";

    await sleep(4000);
  }
  replay_btn.disabled = false;
  // kerala_btn.disabled = true;
}
const precipitation_layer_url = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=e4a7b3e1ec1fca619d10a01bb9b53ba6`;
const precipitation_layer = L.tileLayer(precipitation_layer_url, {
  minZoom: 1,
  maxZoom: 18,
});

const clouds_layer_url = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=e4a7b3e1ec1fca619d10a01bb9b53ba6`;
const clouds_layer = L.tileLayer(clouds_layer_url, {
  minZoom: 1,
  maxZoom: 18,
});

const temp_layer_url = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=e4a7b3e1ec1fca619d10a01bb9b53ba6`;
const temp_layer = L.tileLayer(temp_layer_url, {
  minZoom: 1,
  maxZoom: 18,
});

replay_btn.addEventListener("click", weather_updates_kerala);

// kerala_btn.addEventListener("click", weather_updates_kerala);

precipitation_cBox.addEventListener("change", function () {
  if (this.checked) {
    precipitation_layer.addTo(map);
  } else {
    precipitation_layer.remove();
  }
});
clouds_cBox.addEventListener("change", function () {
  if (this.checked) {
    clouds_layer.addTo(map);
  } else {
    clouds_layer.remove();
  }
});
temp_cBox.addEventListener("change", function () {
  if (this.checked) {
    temp_layer.addTo(map);
  } else {
    temp_layer.remove();
  }
});

async function get_current_weather_forecast_city(latitude, longitude) {
  const response = await fetch(
    `/current_weather_forecast_city/${latitude},${longitude}`
  );
  return await response.json();
}
async function init_setup(latitude, longitude) {
  map.setView([latitude, longitude], zoom);

  // get the current weather, daily forecast based on lat and lon.
  // if success, show it on map
  // else get the weather and forecast of default coordinated. T
  // This is to be handled in node!
  const data = await get_current_weather_forecast_city(latitude, longitude);

  update_header(
    data.weather[0].icon,
    data.main.temp,
    data.main.feels_like,
    data.main.humidity,
    data.wind.speed,
    data.dt,
    data.weather[0].main,
    data.weather[0].description,
    data.name
  );

  precipitation_cBox.checked = true;
  precipitation_layer.addTo(map);
  card.style.display = "block";
}

function success(position) {
  const { latitude, longitude } = position.coords;
  init_setup(latitude, longitude);
}

function error(error) {
  // user denied geolocation. Use default
  console.error(error);
  console.log("setting the default initial view.");
  init_setup(22.765902276494028, 79.84092208864848);
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  console.log("Geolocation is not supported by browser!");
}
