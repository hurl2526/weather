const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const myData = require('../data/myData.json');
const redis = require('redis');
const { json } = require('express');
const REDIS_PORT = 6379;
const client = redis.createClient(REDIS_PORT);

// const api = process.env.API
const api = '0e3e0e92a6657ad2c55b7b7a27388b9e';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

const checkForData = async (req, res, next) => {

  try {
    await client.get(`${req.params.zipcode}`, async (err, info) => {
      if (info === null) {
        console.log('null call');
        return next();
      }

      const currentDate = await Date.now();
      const newData = await JSON.parse(info);
      const redisDate = newData.date;
console.log('redisDate', redisDate)
      if (+currentDate<+redisDate + 1000000){
       console.log(newData)
        // return res.render('index', { newData });
        return res.json({ message: '5 Day Weather report from Cache', newData });
      }
      next();
    });
  } catch (err) {
    next(err);
  }
};

router.get('/weather', (req, res) => {
  res.render('weather');
});

router.post('/weather', async (req, res, next) => {
  try {
    const api =
      'yaY02DcVxoZepInXaCW4dADQXEbZiu4UuDQA9Z8GgcVSMOoyF9QC3zrZwWSnt2mY';
    const zip = req.body.zipCode;
    const url = `https://www.zipcodeapi.com/rest/${api}/info.json/${zip}/degrees`;
    const info = await axios.get(url);
    const latitude = info.data.lat;
    const longitude = info.data.lng;
    return res.redirect(`/weather/${latitude},${longitude}/${zip}`);
  } catch (err) {
    next(err);
  }
});

router.get('/weather/:latLong/:zipcode',checkForData, async (req, res, next) => {
  try {
    const latLong = req.params.latLong;
    const zip = req.params.zipcode
    const url = `https://api.darksky.net/forecast/${api}/${latLong}?exclude=minutely,hourly`;
    // const currentDate = await Date.now();
    const result = await axios.get(url);
    const day1Date = result.data.daily.data[0].time;
    const day1Summary = result.data.daily.data[0].summary;
    const day2Date = result.data.daily.data[1].time;
    const day2Summary = result.data.daily.data[1].summary;
    const day3Date = result.data.daily.data[2].time;
    const day3Summary = result.data.daily.data[2].summary;
    const day4Date = result.data.daily.data[3].time;
    const day4Summary = result.data.daily.data[3].summary;
    const day5Date = result.data.daily.data[4].time;
    const day5Summary = result.data.daily.data[4].summary;
    // const date = result.data.Date
    let weatherReport = {};

    // weatherReport.data.dataforEach(item=>{

    // })
    const currentDate = await Date.now();
    weatherReport.date = currentDate;
    weatherReport.day1Date = new Date(day1Date).toDateString();
    weatherReport.day1Summary = day1Summary;
    weatherReport.day2Date = new Date(day2Date).toDateString();
    weatherReport.day2Summary = day2Summary;
    weatherReport.day3Date = new Date(day3Date).toDateString();
    weatherReport.day3Summary = day3Summary;
    weatherReport.day4Date = new Date(day4Date).toDateString();
    weatherReport.day4Summary = day4Summary;
    weatherReport.day5Date = new Date(day5Date).toDateString();
    weatherReport.day5Summary = day5Summary;
console.log('weatherReport',req.body.zipCode)

    await client.setex(`${zip}`,120,JSON.stringify(weatherReport))


    return res.json({ message: '5 Day Weather report from db', weatherReport });
    // res.render('weather',{weatherReport:JSON.stringify(weatherReport)})
  } catch (error) {
    next(error);
  }
})

// router.get('/redis',(req,res)=>{
//   return client.setex("red",60000,"hey" )
// });

module.exports = router;
