const rp = require('request-promise');
const dotenv = require('dotenv');
dotenv.config();


// This function calls the GEONAMES API
function callGeonamesAPI(city) {
    const options = {
        uri: 'http://api.geonames.org/searchJSON',
        qs: {
            style: 'medium',
            maxRows: '1',
            name_startsWith: city,
            username: process.env.GN_USERNAME
        },
        json: true
    };
    const res = rp.get(options).then((body) => {
        const llc = {
            lat: body.geonames[0].lat,
            lng: body.geonames[0].lng,
            country: body.geonames[0].countryName
        }; // this object contains latitude, longitude and country of the city
        return llc;
    });
    return res;
}

//This function takes the latitude and longitude of a city and the number of days remaining for the trip and gets the weather forecast.
function getWeatherForecast(lat, lng, days) {
    const options = {
        uri: 'http://api.weatherbit.io/v2.0/forecast/daily',
        qs: {
            lat: lat,
            lon: lng,
            key: process.env.WB_API_KEY
        },
        json: true
    };
    const res = rp.get(options).then((result) => {
        const obj = result.data[days];
        const weather = {
            high_temp: obj.high_temp,
            low_temp: obj.low_temp,
            weather_des: obj.weather.description,
            weather_icon: obj.weather.icon
        };
        return weather;
    });
    return res;
}

/*
This function computes the number of days remaining for the trip and returns -1, 0 or a +ve value between 8 and 16.
"-1" means that the trip is in the past.
"0" means that the trip is 7 days or less.
"+ve value" means that the number of days remaining for the the trip is more than a week. If the trip is in more than 16 days
then the return value is 16 because the Weatherbit api can't predict more than 16 days.
*/
function getNumDays(date) {
    const res = parseInt((new Date(date).getTime() - new Date().getTime()) / 86400000);
    if (res < 0)
        return -1;
    if (res <= 7)
        return 0;
    if (res > 7 && res < 17)
        return res - 1;
    return 15;
}

/*
This function gets the weather depending on the date. If "days" is -Ve, this means that the trip has passed so we don't
get a prediction. If "days" is 0, this means that the trip is within a week so we get the current weather. If "days" is +ve,
this means that the number of days remaining is more than a week so we get the wether forecast.
*/
function getTheWeather(lat, lng, date) {
    const days = getNumDays(date);
    if (days < 0)
        return "dummyValue"; //TODO: handel flights in the past
    return getWeatherForecast(lat, lng, days);
}

// This function replace " " with "+"
function removeSpaces(city) {
    return city.replace(/ /g, '+');
}

function getPhoto(city) {
    const options = {
        uri: 'https://pixabay.com/api/',
        qs: {
            key: process.env.P_API_KEY,
            q: removeSpaces(city),
            image_type: 'photo'
        },
        json: true
    };
    const res = rp.get(options).then((data) => {
        return {
            img_url: data.hits[0].webformatURL
        };
    });
    return res;
}

module.exports = {
    callGeonamesAPI: callGeonamesAPI,
    getWeatherForecast: getWeatherForecast,
    getTheWeather: getTheWeather,
    getNumDays: getNumDays,
    removeSpaces: removeSpaces,
    getPhoto: getPhoto
};