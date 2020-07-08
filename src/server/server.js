let ProjectData = [];
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


app.post('/', async (req, res) => {
    const city = req.body.city;
    const date = req.body.date;
    const llc = await apis.callGeonamesAPI(city);
    const promises = [apis.getTheWeather(llc.lat, llc.lng, date), apis.getPhoto(city, llc.country)];
    let result = await Promise.all(promises);
    result.push(llc);
    let obj = mergeObjects(result);
    obj["city"] = city;
    obj["date"] = date;
    ProjectData[0] = obj;
    res.send(ProjectData[0]);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});