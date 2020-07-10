**Description:**
A Travel planner website where the user could enter the destination and date he/she is travelling and the website will show the user information about the place he/she is visiting. The user could enter multiple destinations and dates and for each pair he could also add
flight info.

**Extra Parts:**
1. Pull in an image for the country from Pixabay API when the entered location brings up no results
2. Allow the user to add flight data.
3. Allow the user to remove the trip.
4. Allow the user to add additional trips:
    4.1. Automatically sort additional trips by countdown.
    4.2. Move expired trips to bottom/have their style change so it’s clear it’s expired.

**Notes:**
1. You can test part 4.2 in the *Extra parts* section by entering dates in the past.
2. The website takes on average 3 seconds to show results so please be patient.
3. Please make sure you're in production mode not in development mode when testing the functionality.
4. The .env file contains 3 entries:
    4.1: *GN_USERNAME* for the geonames api.
    4.2: *WB_API_KEY* for the weatherbit api.
    4.3: *P_API_KEY* for the pixabay api.