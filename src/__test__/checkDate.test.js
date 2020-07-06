import {
    checkDate
} from '../client/js/inputValidation.js';

test('Testing checkCityName function', () => {
    const input = '2020-09-25';
    const output = true;
    expect(checkDate(input)).toBe(output);
});