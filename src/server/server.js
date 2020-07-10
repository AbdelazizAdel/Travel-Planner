let projectData = [];
let count = 0;
const PORT = 8080;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apis = require('./apis.js');


const app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('dist'));

//This function merges the 3 objects returned from the 3 apis into a single object
function mergeObjects(arr) {
    let res = {};
    for (const obj of arr) {
        for (const attr in obj) {
            res[attr] = obj[attr];
        }
    }
    return res;
}

//This function adds the city, date, id and remaining days to the main object
function addData(city, date, result) {
    let obj = mergeObjects(result);
    obj["city"] = city;
    obj["date"] = date;
    obj["rem_days"] = apis.getCountdown(date);
    obj["id"] = count++;
    projectData.push(obj);
}

//This function takes the city and date from the user, calls all apis and creates an entry in the projectData
app.post('/trip', async (req, res) => {
    const city = req.body.city;
    const date = req.body.date;
    try {
        const llc = await apis.callGeonamesAPI(city);
        const promises = [apis.getTheWeather(llc.lat, llc.lng, date), apis.getPhoto(city, llc.country)];
        let result = await Promise.all(promises);
        result.push(llc);
        addData(city, date, result);
    } catch (error) {
        res.send(error);
    }
    const data = projectData[projectData.length - 1]
    res.send(data);
});

//This function takes the flight info from the user and adds it to the correct entry in the projectData
app.post('/flight', (req, res) => {
    const data = req.body.data;
    const id = req.body.id;
    for (const obj of projectData) {
        if (obj['id'] == id) {
            for (const attr in data) {
                obj[attr] = data[attr];
            }
            res.send(obj);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});