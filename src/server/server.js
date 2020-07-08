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
    const promises = [apis.getTheWeather(llc.lat, llc.lng, date), apis.getPhoto(city, llc.country)];
    const result = await Promise.all(promises);
    result.push(llc);
    res.send(result);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});