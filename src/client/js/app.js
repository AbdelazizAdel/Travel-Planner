import {
    mainFormListener
} from './eventListeners.js';
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.main-form input[type="submit"]').addEventListener('click', mainFormListener);
});