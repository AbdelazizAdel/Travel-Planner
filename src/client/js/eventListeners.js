import {
    checkCityName,
    checkDate
} from './inputValidation.js';

// Event listener for "save trip" button
export function mainFormListener(event) {
    event.preventDefault();
    const city = document.querySelector('#place').value;
    const date = document.querySelector('#date').value;
    const validInput = checkFormFields(city, date);
    if (!validInput)
        return;
    const obj = {
        city,
        date
    };
    postReq(obj).then((ret) => {
        createCard(ret);
    });
}

//This function shows error messages to the user in the main form if there are any
export function checkFormFields(city, date) {
    if (!checkCityName(city))
        updateErrorUI(true, 'please enter a valid city name. City names should contain only alphabetical characters and spaces.');
    else if (!checkDate(date))
        updateErrorUI(true, 'please enter the date in the correct format YYYY-MM-DD');
    else {
        updateErrorUI(false, null);
        return true;
    }
    return false;
}

// This function updates the UI for the error messages
export function updateErrorUI(error, text) {
    const span = document.querySelector('span');
    if (error) {
        span.classList.remove('hide');
        span.classList.add('error');
        span.innerHTML = `<i>${text}</i>`;
    } else {
        span.classList.remove('error');
        span.classList.add('hide');
    }
}

//This function creates the image in the card
export function createImg(x) {
    let img = document.createElement('img');
    img.src = x;
    return img;
}

//This function creates the sub div elements for the main info section in the card
export function createSubDiv(text1, text2) {
    let subDiv = document.createElement('div');
    subDiv.classList.add('col');
    let span_1 = document.createElement('span');
    span_1.innerHTML = text1;
    let span_2 = document.createElement('span');
    span_2.innerHTML = text2;
    subDiv.appendChild(span_1);
    subDiv.appendChild(span_2);
    return subDiv;
}

//This function creates the main div element for the main info section in the card
export function createMainDiv(obj) {
    let mainDiv = document.createElement('div');
    mainDiv.classList.add('content');
    let text1 = `Destination: ${obj.city}`;
    let text2 = `Country: ${obj.country}`;
    const subDiv_1 = createSubDiv(text1, text2);
    text1 = `Departure date: ${obj.date}`;
    text2 = `Weather description: ${obj.weather_des}`;
    const subDiv_2 = createSubDiv(text1, text2);
    text1 = obj.high_temp == null ? 'High: unavailable' : `High: ${obj.high_temp}&#176;C`;
    text2 = obj.low_temp == null ? 'Low: unavailable' : `Low: ${obj.low_temp}&#176;C`;
    const subDiv_3 = createSubDiv(text1, text2);
    mainDiv.appendChild(subDiv_1);
    mainDiv.appendChild(subDiv_2);
    mainDiv.appendChild(subDiv_3);
    return mainDiv;
}

//This function creates the main info section in the card
export function createMainInfo(obj) {
    let fieldset = document.createElement('fieldset');
    let legend = document.createElement('legend');
    legend.textContent = 'main info';
    fieldset.appendChild(legend);
    const mainDiv = createMainDiv(obj);
    fieldset.appendChild(mainDiv);
    return fieldset;
}

//This function creates the buttons section in the card
export function createButtons() {
    let div = document.createElement('div');
    div.classList.add('btns');
    let btn_1 = document.createElement('button');
    btn_1.type = 'button';
    btn_1.textContent = 'add flight info'
    let btn_2 = document.createElement('button');
    btn_2.type = 'button';
    btn_2.textContent = 'remove trip';
    div.appendChild(btn_1);
    div.appendChild(btn_2);
    return div;
}

//This function creates the card
export function createCard(obj) {
    let sec = document.createElement('section');
    sec.classList.add('card');
    const img = createImg(obj.img_url);
    sec.appendChild(img);
    const mainInfo = createMainInfo(obj);
    sec.appendChild(mainInfo);
    const btns = createButtons();
    sec.appendChild(btns);
    document.querySelector('main').insertAdjacentElement('beforeend', sec);
}

//This function makes a post request to the server
export function postReq(input) {
    const data = fetch('/', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    }).then((response) => {
        return response.json();
    }).then((res) => {
        return res;
    });
    return data;
}