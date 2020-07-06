const {
    getNumDays
} = require('../server/apis.js');

test('Testing getNumDays function', () => {
    const input = '2020-12-25';
    const output = 15;
    expect(getNumDays(input)).toBe(output);
});