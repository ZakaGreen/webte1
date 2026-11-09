// ========================================
// 1. WEATHER API
// ========================================

const weatherUrl =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=48.15" +
    "&longitude=17.11" +
    "&current=temperature_2m,wind_speed_10m,relative_humidity_2m" +
    "&daily=precipitation_probability_max" +
    "&forecast_days=1" +
    "&timezone=auto";

// Fetch starts an asynchronous request; each then callback uses the previous result.
fetch(weatherUrl)
    // Read the response body and convert JSON text into a JavaScript object.
    .then(response => response.json())
    // Display the weather values returned by the API.
    .then(data => {
        document.getElementById("weather").innerHTML =
            "Mesto: Bratislava<br>" +
            "Teplota: " + data.current.temperature_2m + " °C<br>" +
            "Vietor: " + data.current.wind_speed_10m + " km/h<br>" +
            "Vlhkosť: " + data.current.relative_humidity_2m + " %<br>" +
            // The daily forecast is an array; index 0 contains today's value.
            "Maximálna pravdepodobnosť zrážok dnes: " +
                data.daily.precipitation_probability_max[0] + " %<br>" +
            "Čas údajov: " + data.current.time;
    })
    // Show a readable message if fetching or processing the weather fails.
    .catch(error => {

        document.getElementById("weather").innerHTML =
            "Nepodarilo sa načítať počasie.";

        console.error(error);

    });


// ========================================
// 2. LEAFLET MAP
// ========================================

// Leaflet uses [latitude, longitude]; the second setView argument is the zoom level.
const map = L.map("map").setView(
    [48.151965, 17.072995],
    15
);

// Leaflet replaces {z}, {x} and {y} with the zoom level and tile coordinates.
L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);


// ========================================
// 3. MARKER
// ========================================

L.marker([48.151965, 17.072995])
    .addTo(map)
    .bindPopup("FEI STU Bratislava")
    .openPopup();

L.marker([48.1486, 17.1077])
    .addTo(map)
    .bindPopup("Bratislava");

L.marker([38.7322, 35.4853])
    .addTo(map)
    .bindPopup("Best");