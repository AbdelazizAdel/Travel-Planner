import {
    checkCityName
} from '../client/js/inputValidation.js';

test('Testing checkCityName function', () => {
    const input = 'CaIrO';
    const output = true;
    expect(checkCityName(input)).toBe(output);
});