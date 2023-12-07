// Some higher level variables that need to be used outside of functions / within multiple.
var textInput = document.querySelector("#city-search");
var searchBtn = document.querySelector("#search-btn");

// Clicking on a search button, surely it can't be that complicated.
searchBtn.addEventListener('click', APICall);

// The buttons must be dynamically created each time the page is refreshed, so this sequence
// grabs the data from local storage, ensures that an error won't get tossed due to the
// first use case, and calls the function to add buttons to the previous search seciton.
var localHistory = JSON.parse(localStorage.getItem('reports'));
if (localHistory != null) {
    for (x = 0; x < localHistory.length; x++) {
        addHistory(localHistory[x].city.name);
    }
}
/** So you want to know the weather report for a city?
 * First, we have to grab the city name. Having repeat cities would be redundant, so to ensure
 * that, we must do a few things. First, we create a variable that will gate the API calls behind
 * a boolean that will be changed when a repeat offender is found. To find the repeat offender,
 * we must regrab the local storage data, again test the first use case, then search through
 * each item in storage to see if it matches up. If it does, it will call the function to
 * reuse the data in storage, then flip the boolean to prevent the API calls.
 */
function APICall(event) {
    event.preventDefault();
    var cityName = textInput.value;
    var goFetch = true;
    var updatedHistory = JSON.parse(localStorage.getItem('reports'));
    if (updatedHistory != null) {
        for (y = 0; y < updatedHistory.length; y++) {
            if (cityName == updatedHistory[y].city.name) {
                findForecast(cityName);
                goFetch = false;
            }
        }
    }
/** The API fetches actually get their time to shine!
 * Using the geocoder API, we can grab the coordinates of a typed city by inputing the name
 * in the correct place within the API call. Using this call, we untangle the data, then put 
 * it right back into another call, which will give us the weather data. Untangle the data,
 * then call the functions to render the data on the page, store it, and add a button to 
 * the search history. These are all explained below.
 */
    if (goFetch) {
        var retrieveCoordsURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=5971b963d4e77a5142b39cd0020e4736";

        fetch(retrieveCoordsURL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var longitude = data[0]["lon"];
                var latitude = data[0]["lat"];
                var retrieveWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=5971b963d4e77a5142b39cd0020e4736&units=imperial";
                fetch(retrieveWeatherURL)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        loadForecast(data);
                        storeForecast(data);
                        addHistory(data.city.name);
                    });
            });
    }
}
/** This function renders the data into the page, DOM traversal abounds.
 * The structure of the page is already set, so inserting / exchanging the data is
 * all that needs to happen. The first few lines of the funciton take the first object
 * in the API's data list, which contains the current weather data. String concatenation abounds.
 * The API call contains an "imperial" qualifier, so that's why the units are as such.
 * The for loop utilizes the div element which contains the cards for the weather forecast.
 * Let me explain the wild indecies. The weather data comes in a list indexed 0-39, each index
 * a three hour increment. Each 8 entries is 24 hours, one day ahead, so p*8 increments each
 * weather data input one day ahead. However, we need to land one off multiples of 8, and we begin
 * at 0, so + 7 guarantees that we are exactly 8 indeces ahead of the current, then we increment in 24hr
 * steps. However, this is only for the weather data list. The children of the div containing the cards
 * also contains an h1 element that needs to get skipped, then we hit the other five children elements.
 * I suppose that five is hardcoded, and we could get a variable for how many days of forecase we'd like,
 * but that's a future project.
 */
function loadForecast(report) {
    document.querySelector("#city-name").textContent = "Current Weather in " + report.city.name + " today, " + dayjs(report.list[0].dt * 1000).format('MM/DD/YYYY');
    document.querySelector("#main-temp").textContent = "Temp: " + report.list[0].main.temp + " °F";
    document.querySelector("#main-wind").textContent = "Wind: " + report.list[0].wind.speed + " mph";
    document.querySelector("#main-humid").textContent = "Humidity: " + report.list[0].main.humidity + " %";
    document.querySelector("#main-img").setAttribute('src',"https://openweathermap.org/img/wn/" + report.list[0].weather[0].icon + "@2x.png");
    
    var forecastEl = document.querySelector("#forecast");
    for (p = 0; p < 5; p++) {
        var newDay = dayjs(report.list[p*8 + 7].dt * 1000);
        forecastEl.children[p+1].children[0].textContent = dayjs(newDay).format('MM/DD/YYYY');
        forecastEl.children[p+1].children[1].setAttribute('src',"https://openweathermap.org/img/wn/" + report.list[p].weather[0].icon + "@2x.png");
        forecastEl.children[p+1].children[2].textContent = "Temp: " + report.list[p*8 + 7].main.temp + " °F";
        forecastEl.children[p+1].children[3].textContent = "Wind: " + report.list[p*8 + 7].wind.speed + " mph";
        forecastEl.children[p+1].children[4].textContent = "Humidity: " + report.list[p*8 + 7].main.humidity + " %";
    }
}

// This function checks if local storage has anything inside. If it does, it will untangle the data,
// put the new data into the array, then shove it back in storage. If it contains nothing,
// it will ensure the data is put into storage as an array.
function storeForecast(report) {
    if (localStorage.getItem('reports') != null) {
        const reportArray = JSON.parse(localStorage.getItem('reports'));
        reportArray.push(report);
        localStorage.setItem('reports', JSON.stringify(reportArray));
    } else {
        const newArray = [report];
        localStorage.setItem('reports', JSON.stringify(newArray));
    }
}

// This function creates a button to complement the data placed in local storage by
// using a component of that exact data, such that the data can be matched later.
function addHistory(city) {
    var newBtn = document.createElement('button');
    newBtn.textContent = city;
    newBtn.setAttribute('class', "w-100 my-1 text-light border-2 bg-secondary rounded-pill");
    document.body.children[1].children[0].children[2].appendChild(newBtn);
    newBtn.addEventListener('click', function() {findForecast(city)});
}

// This function is critical. It regrabs the storage in order to search it once again,
// then runs through to find the matching entry in the array. Then, using that entry,
// it calls the function to render that data back into the page. This would be a good spot to put an error alert.
function findForecast(reportName) {
    var storedArray = JSON.parse(localStorage.getItem('reports'));
    for (n = 0; n < storedArray.length; n++) {
        if (reportName == storedArray[n].city.name) {
            loadForecast(storedArray[n]);
        }
    }
}