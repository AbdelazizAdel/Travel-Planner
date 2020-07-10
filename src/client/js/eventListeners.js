import {
    checkCityName,
    checkDate,
    checkTime,
    checkDuration
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
    postReq('/trip', obj).then((ret) => {
        let arr = JSON.parse(localStorage.getItem('projectData'));
        arr.push(ret)
        sort(arr);
        const pos = arr.indexOf(ret);
        ret['pos'] = pos == 0 ? -1 : arr[pos - 1]['id'];
        localStorage.setItem('projectData', JSON.stringify(arr));
        createCard(ret);
        document.querySelector(`#sec_${ret.id}`).addEventListener('click', cardListener);
    });
}

//Event listener for all the buttons inside the card
function cardListener(event) {
    const card = event.currentTarget;
    const target = event.target;
    if (target == card.querySelector('#add-flight')) { //checks if the target is the "add flight info" button
        const form = createFlightInfoForm();
        card.querySelector('.btns').insertAdjacentElement('beforebegin', form);
        card.querySelector('.btns button:first-child').remove();
    } else if (target == card.querySelector('.flight-form button')) { // checks if the target is the "save" button in the flight info form
        const time = card.querySelector('#takeoff-time').value;
        const dur = card.querySelector('#flight-duration').value;
        if (!checkFlightFormFields(time, dur, card))
            return;
        saveData(card).then((obj) => {
            card.querySelector('.main-info').insertAdjacentElement('afterend', createFlightInfo(obj));
            card.querySelector('.flight-form').classList.add('hide');
        });
    } else if (target == card.querySelector('#remove')) { // checks if the target is the "remove" button
        const id = parseInt(/[0-9]+$/.exec(card.id)[0]);
        card.remove();
        let arr = JSON.parse(localStorage.getItem('projectData'));
        deleteEntry(id, arr);
        localStorage.setItem('projectData', JSON.stringify(arr));
    }
}


//This function checks for valid takeoff time and flight duration and showa appropriate error messages to the user if any
function checkFlightFormFields(time, dur, card) {
    if (!checkTime(time)) {
        card.querySelector('.btn-col + div span').textContent = 'please enter time in this format HH:MM';
        card.querySelector('.btn-col + div').classList.remove('hide');
        return false;
    }
    if (!checkDuration(dur)) {
        card.querySelector('.btn-col + div span').textContent = 'please enter duration in this format HH:MM';
        card.querySelector('.btn-col + div').classList.remove('hide');
        return false;
    }
    card.querySelector('.btn-col + div span').textContent = '';
    card.querySelector('.btn-col + div').classList.add('hide');
    return true;
}

//This function saves the flight info data in the server 
function saveData(card) {
    const obj = {
        data: {
            airline: card.querySelector('#airline').value,
            flight_no: card.querySelector('#flight-number').value,
            dep_airport: card.querySelector('#departure-airport').value,
            arr_airport: card.querySelector('#arrival-airport').value,
            takeoff_time: card.querySelector('#takeoff-time').value,
            flight_dur: card.querySelector('#flight-duration').value
        },
        id: parseInt(/[0-9]+$/.exec(card.id)[0])
    };
    const res = postReq('/flight', obj).then((ret) => {
        let arr = JSON.parse(localStorage.getItem('projectData'));
        for (const obj of arr) {
            if (obj['id'] == ret['id']) {
                for (const attr in ret) {
                    obj[attr] = ret[attr];
                }
            }
        }
        localStorage.setItem('projectData', JSON.stringify(arr));
        return ret;
    });
    return res;
}

//This function shows error messages to the user in the main form if there are any
function checkFormFields(city, date) {
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
function updateErrorUI(error, text) {
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
function createImg(src, rem_days) {
    let div = document.createElement('div');
    div.classList.add('img');
    let img = document.createElement('img');
    img.src = src;
    let span = document.createElement('span');
    span.innerHTML = `${rem_days}<br>days<br>away`;
    div.appendChild(img);
    div.appendChild(span);
    return div;
}

//This function creates the sub div elements for the main info and flight info  sections in the card
function createSubDiv(text1, text2) {
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
function createMainDiv(obj) {
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
function createMainInfo(obj) {
    let fieldset = document.createElement('fieldset');
    fieldset.classList.add('main-info');
    let legend = document.createElement('legend');
    legend.textContent = 'main info';
    fieldset.appendChild(legend);
    const mainDiv = createMainDiv(obj);
    fieldset.appendChild(mainDiv);
    return fieldset;
}

//This function creates the buttons section in the card
function createButtons() {
    let div = document.createElement('div');
    div.classList.add('btns');
    let btn_1 = document.createElement('button');
    btn_1.type = 'button';
    btn_1.id = "add-flight";
    btn_1.textContent = 'add flight info'
    let btn_2 = document.createElement('button');
    btn_2.id = "remove";
    btn_2.type = 'button';
    btn_2.textContent = 'remove trip';
    div.appendChild(btn_1);
    div.appendChild(btn_2);
    return div;
}

//This function creates the card
function createCard(obj) {
    let sec = document.createElement('section');
    sec.classList.add('card');
    if (obj.rem_days < 0)
        sec.classList.add('passed');
    sec.id = `sec_${obj.id}`;
    const img = createImg(obj.img_url, obj.rem_days);
    sec.appendChild(img);
    const mainInfo = createMainInfo(obj);
    sec.appendChild(mainInfo);
    const btns = createButtons();
    sec.appendChild(btns);
    if (obj['pos'] == -1)
        document.querySelector('.cards').insertAdjacentElement('afterbegin', sec);
    else
        document.querySelector(`#sec_${obj['pos']}`).insertAdjacentElement('afterend', sec);
}

//This function makes a post request to the server
function postReq(url, input) {
    const data = fetch(url, {
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

//This function creates label and input for flight info form
function createInput(text, id) {
    const frag = document.createDocumentFragment();
    let label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = text;
    let input = document.createElement('input');
    input.type = 'text';
    input.name = id;
    input.id = id;
    frag.appendChild(label);
    frag.appendChild(input);
    return frag;
}

//This function creates div elements for the flight info form
function createFlightFormDiv(text1, id1, text2, id2) {
    const div = document.createElement('div');
    div.classList.add('col');
    div.appendChild(createInput(text1, id1));
    div.appendChild(createInput(text2, id2));
    return div;
}

//This function creates the flight info form
function createFlightInfoForm() {
    let form = document.createElement('form');
    form.classList.add('flight-form');
    let fieldset = document.createElement('fieldset');
    let legend = document.createElement('legend');
    legend.textContent = 'flight info';
    fieldset.appendChild(legend);
    const div_1 = createFlightFormDiv('Airline:', 'airline', 'Flight number:', 'flight-number');
    fieldset.appendChild(div_1);
    const div_2 = createFlightFormDiv('Departure airport:', 'departure-airport', 'Arrival airport:', 'arrival-airport');
    fieldset.appendChild(div_2);
    const div_3 = createFlightFormDiv('Takeoff time:', 'takeoff-time', 'Flight duration:', 'flight-duration');
    fieldset.appendChild(div_3);
    let div_4 = document.createElement('div');
    div_4.classList.add('btn-col');
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'save';
    div_4.appendChild(btn);
    fieldset.appendChild(div_4);
    let div_5 = document.createElement('div');
    div_5.classList.add('hide');
    div_5.appendChild(document.createElement('span'));
    fieldset.appendChild(div_5);
    form.appendChild(fieldset);
    return form;
}

//This function creates the main div for the flight info section in the card
function createFlightDiv(obj) {
    const div = document.createElement('div');
    div.classList.add('content');
    let text1 = `Airline: ${obj.airline}`;
    let text2 = `Flight number: ${obj.flight_no}`;
    div.appendChild(createSubDiv(text1, text2));
    text1 = `Departure airport: ${obj.dep_airport}`;
    text2 = `Arrival airport: ${obj.arr_airport}`;
    div.appendChild(createSubDiv(text1, text2));
    text1 = `Takeoff time: ${obj.takeoff_time}`;
    text2 = `Flight duration: ${obj.flight_dur}`;
    div.appendChild(createSubDiv(text1, text2));
    return div;
}

//This function creates the flight info section in the card
function createFlightInfo(obj) {
    let fieldset = document.createElement('fieldset');
    let legend = document.createElement('legend');
    legend.textContent = 'flight info';
    fieldset.appendChild(legend);
    fieldset.appendChild(createFlightDiv(obj));
    return fieldset;
}

//This function sorts the projectData array according to remaining days and puts trips that already passed at the end(-ve reaminig days)
function sort(arr) {
    arr.sort((a, b) => {
        if (a['rem_days'] < 0 && b['rem_days'] >= 0)
            return 1;
        if (a['rem_days'] >= 0 && b['rem_days'] < 0)
            return -1;
        if (a['rem_days'] < 0 && b['rem_days'] < 0)
            return b['rem_days'] - a['rem_days'];
        return a['rem_days'] - b['rem_days'];
    });
}

//This function deletes an entry from projectData with the specified id in the local storage
function deleteEntry(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]['id'] == id) {
            arr.splice(i, 1);
            break;
        }
    }
}