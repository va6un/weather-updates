const express = require("express");
const fetch = require("node-fetch");
const districts = require("./districts");
require("dotenv").config();

const data = require("./districts");

const app = express();
const port = process.env.PORT || 5050;

app.use(express.static("public"));

const key = process.env.API_KEY;

app.get("/current_weather_forecast_city/:coordinates", async (req, res) => {
  const [latitude, longitude] = req.params.coordinates.split(",");
  const owm_url = `https://api.openweathermap.org/data/2.5//weather?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&appid=${key}&units=metric`;
  const response = await fetch(owm_url);
  if(response.ok){
    const data = await response.json();
    res.json(data);
  }else{
    console.error('Failed to get response from OWM.');
    res.end();
  }
});

app.get("/api", async (req, res) => {
  const weather = [];
  for (district of data.districts) {
    const { city, lat, lon, img } = district;
    // console.log(city);
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${key}&units=metric`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      data["city"] = city;
      weather.push(data);
    } else {
      console.error("Error fetching openweathermap.com!");
      res.end();
    }
  }
  console.log(`Sending ${weather.length} documents to client.`);
  res.json(weather);
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
