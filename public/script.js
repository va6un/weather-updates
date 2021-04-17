/**
 * handle fetch error: https://stackoverflow.com/questions/38235715/fetch-reject-promise-and-catch-the-error-if-status-is-not-ok
 */
const card = document.getElementById('card');
card.style.display = 'none';
const map = L.map('map', { zoomControl: false }).setView([8.4833, 76.9167], 9);
const mapTileURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
const mapTileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

L.tileLayer(mapTileURL, {
    attribution: mapTileAttribution,
    maxZoom: 18,
    minZoom: 1,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoidmFydW5iIiwiYSI6ImNrbmZqYnQwMDJ2ZTUycXA5Y2Zya2QzM3gifQ.r7iv0_XbuD2Y8fzN0BmY8A'
}).addTo(map);

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
    const city = document.getElementById('city');
    const date = document.getElementById('date');
    const description = document.getElementById('description');
    const icon = document.getElementById('icon');
    const temperature = document.getElementById('temperature');
    const feels = document.getElementById('feels');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const milli = new Date();

    city.textContent = district.name;
    date.textContent = getTodaysDate(milli);
    description.textContent = district.weather[0].description;
    icon.src = `/icons/${district.weather[0].icon}@2x.png`;
    temperature.textContent = parseInt(district.main.temp);
    feels.textContent = parseInt(district.main.feels_like);
    humidity.textContent = district.main.humidity;
    wind.textContent = parseInt((parseFloat(district.wind.speed) * 3.6));
}

const letsFly = async () => {
    const response = await fetch('/api');

    // only in a true case we need to proceed further.
    if (response.ok) {
        return response;
    } else {
        throw new Error('Response from fetch request: ', response.ok);
    }
}

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

letsFly().then(async response => {
    const state = await response.json();
    const marker = L.marker();

    for (district of state) {
        // console.log(district);
        document.getElementById('overlay').style.display = 'none';
        map.setView([district.coord.lat, district.coord.lon], 9, {
            "animate": true,
            "pan": {
                "duration": 3
            }
        });
        marker.setLatLng([district.coord.lat, district.coord.lon]).addTo(map);
        updateUI(district);
        card.style.display = 'block';
        await sleep(4000);
    }
}).catch(error => {
    console.log(error)
});