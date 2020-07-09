import {
    mainFormListener,
    addFlightInfoListener
} from './eventListeners.js';
document.querySelector('.main-form input[type="submit"]').addEventListener('click', mainFormListener);