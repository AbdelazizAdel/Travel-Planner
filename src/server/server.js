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

app.post('/', async (req, res) => {
    const city = req.body.city;
    const date = req.body.date;
    let result;
    let llc;
    try {
        llc = await apis.callGeonamesAPI(city);
        const promises = [apis.getTheWeather(llc.lat, llc.lng, date), apis.getPhoto(city, llc.country)];
        result = await Promise.all(promises);
    } catch (error) {
        res.send(error);
    }
    result.push(llc);
    addData(city, date, result);
    const data = projectData[projectData.length - 1]
    projectData.sort((a, b) => {
        if (a['rem_days'] < 0 && b['rem_days'] >= 0)
            return 1;
        if (a['rem_days'] >= 0 && b['rem_days'] < 0)
            return -1;
        if (a['rem_days'] < 0 && b['rem_days'] < 0)
            return b['rem_days'] - a['rem_days'];
        return a['rem_days'] - b['rem_days'];
    });
    const pos = projectData.indexOf(data);
    data['pos'] = pos == 0 ? -1 : projectData[pos - 1]['id'];
    res.send(data);
});

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

//This function deletes an entry from projectData with the specified id
function deleteEntry(id) {
    let found = false;
    for (let i = 0; i < projectData.length; i++) {
        if (projectData[i]['id'] == id) {
            found = true;
            projectData.splice(i, 1);
            break;
        }
    }
    return found;
}

app.delete('/delete', (req, res) => {
    const id = req.body.id;
    const found = deleteEntry(id);
    if (found)
        res.send({
            'deleted': true
        });
    else
        res.send({
            'deleted': false
        });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});