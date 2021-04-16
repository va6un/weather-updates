const map = L.map('map', { zoomControl: false }).setView([10.519475572241758, 76.21569782786551], 4);
const mapTileURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
const mapTileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
const startBtn = document.getElementById('startBtn');
const card = document.getElementById('card');

card.style.display = 'none';

L.tileLayer(mapTileURL, {
    attribution: mapTileAttribution,
    maxZoom: 18,
    minZoom: 1,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoidmFydW5iIiwiYSI6ImNrbmZqYnQwMDJ2ZTUycXA5Y2Zya2QzM3gifQ.r7iv0_XbuD2Y8fzN0BmY8A'
}).addTo(map);

const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

const getTodaysDate = (milli) => {
    const date = new Date(milli);
    const day = date.getDay();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = (hours > 12) ? `${hours - 12}` : `${hours}`;
    const ampm = (hours > 12) ? 'pm' : 'am';
    return `${weekDays[day]} ${time}:${minutes} ${ampm}`;
}
const updateUI = (district) => {
    const name = document.getElementById('name');
    const date = document.getElementById('date');
    const description = document.getElementById('description');
    const temperature = document.getElementById('temperature');
    const feels = document.getElementById('feels');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const milli = new Date();

    name.textContent = district.name;
    date.textContent = getTodaysDate(milli);
    description.textContent = district.weather[0].description;
    temperature.textContent = parseInt(district.main.temp);
    feels.textContent = parseInt(district.main.feels_like);
    humidity.textContent = district.main.humidity;
    wind.textContent = district.wind.speed;
}

const startUpdating = async () => {
    const response = await fetch('/api');
    const state = await response.json();
    // console.log(state);
    const marker = L.marker();
    // const popup = L.popup();

    for (district of state) {
        await delay(3000);
        // console.log(district);
        await map.setView([district.coord.lat, district.coord.lon], 9, {
            "animate": true,
            "pan": {
                "duration": 2
            }
        });
        document.getElementById('loader').style.display = 'none';
        // popup.setLatLng([district.coord.lat, district.coord.lon]).setContent('Hai');
        marker.setLatLng([district.coord.lat, district.coord.lon]).addTo(map);
        updateUI(district);
        card.style.display = 'block';
    }
}

startUpdating();
        // startBtn.addEventListener('click', startUpdating);