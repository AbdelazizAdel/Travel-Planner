let projectData = [];
let count = 0;
const PORT = 8080;
const path = require('path');
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
app.use(express.static('dist', {
    index: false
}));

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

//This function sorts the projectData array according to remaining days and puts trips that already passed at the end(-ve reaminig days)
function sort() {
    projectData.sort((a, b) => {
        if (a['rem_days'] < 0 && b['rem_days'] >= 0)
            return 1;
        if (a['rem_days'] >= 0 && b['rem_days'] < 0)
            return -1;
        if (a['rem_days'] < 0 && b['rem_days'] < 0)
            return b['rem_days'] - a['rem_days'];
        return a['rem_days'] - b['rem_days'];
    });
}

//This function handels the main page of the website
app.get('/', (req, res) => {
    count = 0;
    projectData = [];
    res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
})

//This function takes the city and date from the user, calls all apis and creates an entry in the projectData
app.post('/', async (req, res) => {
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
    sort();
    const pos = projectData.indexOf(data);
    data['pos'] = pos == 0 ? -1 : projectData[pos - 1]['id']; //In order to know where to put the new trip in the view
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

//This function handels the delete request from the user to remove a trip
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