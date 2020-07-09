const rp = require('request-promise'); //to make http requests
const dotenv = require('dotenv'); // for the environment variables
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

//This function computes the countdown for the trip
function getCountdown(date) {
    const res = parseInt((new Date(date).getTime() - new Date().getTime()) / 86400000);
    return res;
}

/*
This function computes the number of days remaining for the trip and returns 0 or a +ve value between 8 and 16.
"0" means that the trip is 7 days or less.
"+ve value" means that the number of days remaining for the the trip is more than a week. If the trip is in more than 16 days
then the return value is 15 because the Weatherbit api can't predict more than 16 days.
*/
function getNumDays(date) {
    const res = getCountdown(date);
    if (res <= 7)
        return 0;
    if (res > 7 && res < 17)
        return res - 1;
    return 15;
}


//This function gets the weather depending on the date
function getTheWeather(lat, lng, date) {
    const days = getNumDays(date);
    return getWeatherForecast(lat, lng, days);
}

// This function replace " " with "+"
function removeSpaces(city) {
    return city.replace(/ /g, '+');
}

/* this function takes a city and a country as an input and gets a photo of the city from Pixabay API if the API doesn't return
any results for the city we get the photo of the country instead.
*/
function getPhoto(city, country) {
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
    }).catch((error) => {
        options.qs.q = removeSpaces(country);
        return rp.get(options).then((data) => {
            return {
                img_url: data.hits[0].webformatURL
            };
        });
    });
    return res;
}

module.exports = {
    callGeonamesAPI,
    getWeatherForecast,
    getTheWeather,
    getNumDays,
    removeSpaces,
    getPhoto,
    getCountdown
};