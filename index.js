const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5050;

app.use(express.static('public'));

app.get('/api', async (req, res) => {
    const districts = ['Trivandrum', 'Kollam', 'Alappuzha', 'Pathanamthitta', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Kalpatta', 'Kannur', 'Kasaragod'];

    const key = process.env.API_KEY;


    const weather = [];

    for (district of districts) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${district}&appid=${key}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        weather.push(data);
    }

    // console.log(weather);

    res.json(weather);

});
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});