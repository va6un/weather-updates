/**
 * handle fetch error: https://stackoverflow.com/questions/38235715/fetch-reject-promise-and-catch-the-error-if-status-is-not-ok
 */
const card = document.getElementById("card");
//  card.style.display = "none";
const map = L.map("map", { zoomControl: false }).setView([8.4833, 76.9167], 9);
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
const updateUI = (district) => {
  const { city, current, daily, alert } = district;

  const city_name = document.getElementById("city");
  const date_time = document.getElementById("date_time");
  const main = document.getElementById("main");
  const description = document.getElementById("description");
  const icon_main = document.getElementById("icon_main");
  const temp_main = document.getElementById("temp_main");
  const temp_feels = document.getElementById("temp_feels");
  const humidity = document.getElementById("humidity");
  const wind = document.getElementById("wind");

  city_name.textContent = city;
  date_time.textContent = format_UTC_local(current.dt, false);
  main.textContent = current.weather[0].main;
  description.textContent = current.weather[0].description;
  icon_main.src = `/icons/${current.weather[0].icon}@2x.png`;
  temp_main.textContent = parseInt(current.temp);
  temp_feels.textContent = parseInt(current.feels_like);
  humidity.textContent = current.humidity;
  wind.textContent = parseInt(parseFloat(current.wind_speed) * 3.6);

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
    small_temp.textContent = `${max_temp}°C`;
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

letsFly()
  .then(async (response) => {
    const state = await response.json();
    const marker = L.marker();
    for (district of state) {
      // console.log(district);
      const { lat, lon } = district;
      document.getElementById("overlay").style.display = "none";

      map.setView([lat, lon], 9, {
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
  })
  .catch((error) => {
    console.log(error);
  });
