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

app.post('/', async (req, res) => {
    const city = req.body.city;
    const date = req.body.date;
    const llc = await apis.callGeonamesAPI(city);
    const weather = await apis.getTheWeather(llc.lat, llc.lng, date);
    const photo = await apis.getPhoto(city);
    res.send(photo);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});