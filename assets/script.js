/**
 * Let's think up general strategy for this code... a psuedocode if you may.
 * 
 * First, we event listen for the "search button" (make it an ID'd button you dingaling)
 * When the button gets pressed, fetch the data. (well actually, the first thing we should do is check if the data is already there in local storage)
 * Remember, the data has to go through two APIs or something (i think), so we'll be 
 *  getting a city name
 *  then have to translate that to a coordinates (that relate to a station?) 
 *  then grab the city's weather data
 * When we get the weather data, 
 *  we slot it into the cards (they probably shouldn't be there to start? maybe display hide them?)
 *  we slot it into local storage (using the city name as the key)
 *  we create a button with an event listener to reload that local storage data
 * 
 * ... that doesn't seem soooo bad right? should also be able to reuse code from last couple assignments, at least for help with storage and interacting with DOM
 */

// https://api.openweathermap.org/geo/1.0/direct?q=[INPUT TEXT HERE]&limit=5&appid=5971b963d4e77a5142b39cd0020e4736
// ^^ grabs info about location (specifically lat and long) based on text

//https://api.openweathermap.org/data/2.5/forecast?lat=[INPUT LAT]&lon=[INPUT LON]&appid=5971b963d4e77a5142b39cd0020e4736
// ^^ grabs weather info

var textInput = document.querySelector("#city-search");
var searchBtn = document.querySelector("#search-btn");

searchBtn.addEventListener('click', APICall);

function APICall(event) {
    event.preventDefault();
    var cityName = textInput.value;
    var retrieveCoordsURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=5971b963d4e77a5142b39cd0020e4736";

    fetch(retrieveCoordsURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // render city name at beginning of top portion
            var longitude = data[0]["lon"];
            var latitude = data[0]["lat"];
            var retrieveWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=5971b963d4e77a5142b39cd0020e4736";
            fetch(retrieveWeatherURL)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data.list[0].main.temp);//list[i].main.temp | list[i].wind.sppeed | list[i].dt (unicode)
                // render top portion
                // for loop to render cards
                });
        });
}