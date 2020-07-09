//This function checks for valid city names
export function checkCityName(city) {
    const regex = /[^a-z ]|(^\s*$)/i;
    return !regex.test(city);
}

//This function checks for valid dates
export function checkDate(date) {
    const regex = /^([1-9][0-9][0-9][0-9])-(0[1-9]|1[0-2])-([0-2][0-9]|3[0-1])$/;
    return regex.test(date);
}

//This function checks for valid time
export function checkTime(time) {
    const regex = /^(([0-1][0-9])|(2[0-3])):[0-5][0-9]$/;
    return regex.test(time);
}