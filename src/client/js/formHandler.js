import {
    checkCityName,
    checkDate
} from './inputValidation.js';

// Event listener for "save trip" button
export function submitListener(event) {
    event.preventDefault();
    const city = document.querySelector('#place').value;
    const date = document.querySelector('#date').value;
    const validInput = checkFormFields(city, date);
}

//This function shows error messages to the user if there are any
export function checkFormFields(city, date) {
    if (!checkCityName(city))
        updateErrorUI(true, 'please enter a valid city name. City names should contain only alphabetical characters and spaces.');
    else if (!checkDate(date))
        updateErrorUI(true, 'please enter the date in the correct format YYYY-MM-DD');
    else {
        updateErrorUI(false, null);
        return false;
    }
    return true;
}

// This function updates the UI for the error messages
export function updateErrorUI(error, text) {
    const span = document.querySelector('span');
    if (error) {
        span.classList.remove('no-error');
        span.classList.add('error');
        span.innerHTML = `<i>${text}</i>`;
    } else {
        span.classList.remove('error');
        span.classList.add('no-error');
    }
}

document.querySelector('input[type="submit"]').addEventListener('click', submitListener);