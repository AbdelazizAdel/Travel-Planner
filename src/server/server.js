const PORT = 8080;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('dist'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});