const express = require("express");
const fetch = require("node-fetch");
const districts = require("./districts");
require("dotenv").config();
const { MongoClient } = require('mongodb');
const cors = require('cors');

const data = require("./districts");

const app = express();
const port = process.env.PORT || 5050;

app.use(express.static("public"));
// app.use(cors())
const key = process.env.API_KEY;

const whitelist = ['https://determined-kirch-891cdb.netlify.app'];
const cors_option = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.get("/current_weather_forecast_city/:coordinates", async (req, res) => {
  try{
    const [latitude, longitude] = req.params.coordinates.split(",");
    const owm_url = `https://api.openweathermap.org/data/2.5//weather?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&appid=${key}&units=metric`;
    const response = await fetch(owm_url);
    if(response.status >= 200 && response.status <= 299){
    const data = await response.json();
    res.status(200).json(data);
  }else{
    console.error('Failed to get response from OWM.');
    res.status(500).end();
  }
  }catch(e){
    console.error(e);
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
  res.status(200).json(weather);
});

/*
 blog - api's
*/

// flickr url details
const flickr_api_key = process.env.FLICKR_API_KEY;
const method = 'flickr.people.getPhotos';
const user_id = '137579347%40N08';
const flickr_url = `https://www.flickr.com/services/rest/?method=${method}&api_key=${flickr_api_key}&user_id=${user_id}&format=json&nojsoncallback=1`;

// mongo url details
const mongo_password = process.env.MONGO_PASSWORD;
const database = 'flickr';
const collection = 'imageAndTitle';
const uri = `mongodb+srv://varun:${mongo_password}@1-server-side-cluster.o3rti.mongodb.net/${database}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function photoSearch() {
    const response = await fetch(flickr_url);
    if(response.ok){
        const data = await response.json();
        return data.photos.photo;
    }else{
        // error in response.
        return [];
    }
}

async function createMultipleImages(client){
    const images = await photoSearch();
    
    if(images.length > 0 && typeof images !== 'undefined'){
        const result = await client.db(database).collection(collection).deleteMany({});
        console.log(`${result.deletedCount} documents are deleted from '${collection}' collection.`);

        const response = await client.db(database).collection(collection).insertMany(images);
        console.log(`${response.insertedCount} new images are inserted`);
        console.log(`New images inserted`);
    }
}

// update database. retrive image data from flickr and update it to database.
// 
app.get('/update_database',cors(cors_option), async (req, res) => {
  console.log('GET REQUEST: /update_database');
  try{
    console.log(`Is mongo client connected: ${client.isConnected()}`);
    if(!client.isConnected()){
      await client.connect();
      console.log(`Is mongo client connected: ${client.isConnected()}`);
    }
    await createMultipleImages(client);
    res.status(200).json({message: 'Updated database with new images.'});
  }catch(e){
    console.error(e);
    res.status(500).json({message: 'Internal server error. Unable to update database.'});
  }finally{
      // await client.close();
      console.log(`Is mongo client connected: ${client.isConnected()}`);
  }
});

// get all images and their titles from db.
async function findAllImagesAndTitles(client){
    const cursor = await client.db(database).collection(collection).find();
    const images = await cursor.toArray();
    return images;
}

// retrives images from database and send back to client.
app.get('/photo_search', cors(cors_option), async (req, res) => {
  console.log('GET REQUEST: /photo_search');
  try{
    console.log(`Is mongo client connected: ${client.isConnected()}`);
    if(!client.isConnected()){
      await client.connect();
    }
    console.log(`Is mongo client connected: ${client.isConnected()}`);

    const data = await findAllImagesAndTitles(client);
    res.status(200).json(data);
  }catch(e){
    console.error(e);
    res.status(500).json({message: 'Internal server error. No content.'});
  }finally{
    // await client.close();
    console.log(`Is mongo client connected: ${client.isConnected()}`);
  }
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
