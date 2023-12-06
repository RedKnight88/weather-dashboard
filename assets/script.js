var textInput = document.querySelector("#city-search");
var searchBtn = document.querySelector("#search-btn");

searchBtn.addEventListener('click', APICall);

var localHistory = JSON.parse(localStorage.getItem('reports'));
if (localHistory != null) {
    for (x = 0; x < localHistory.length; x++) {
        addHistory(localHistory[x].city.name);
    }
}

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
                        console.log(data); // list[i].dt (unicode)
                    });
            });
    }
}

function loadForecast(report) {
    document.querySelector("#city-name").textContent = "Current Weather in " + report.city.name; // ADD DATE
    document.querySelector("#main-temp").textContent = "Temp: " + report.list[0].main.temp + " F";
    document.querySelector("#main-wind").textContent = "Wind: " + report.list[0].wind.speed + " mph";
    document.querySelector("#main-humid").textContent = "Humidity: " + report.list[0].main.humidity + " %";
    document.querySelector("#main-img").setAttribute('src',"https://openweathermap.org/img/wn/" + report.list[0].weather[0].icon + "@2x.png");
    // render top portion
                
    // for loop to render cards
    var forecastEl = document.querySelector("#forecast");
    for (p = 0; p < 5; p++) {
        // ADD DATE
        forecastEl.children[p+1].children[1].setAttribute('src',"https://openweathermap.org/img/wn/" + report.list[p].weather[0].icon + "@2x.png");
        forecastEl.children[p+1].children[2].textContent = "Temp: " + report.list[p].main.temp + " F";
        forecastEl.children[p+1].children[3].textContent = "Wind: " + report.list[p].wind.speed + " mph";
        forecastEl.children[p+1].children[4].textContent = "Humidity: " + report.list[p].main.humidity + " %";
    }
}

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

function addHistory(city) {
    var newBtn = document.createElement('button');
    newBtn.textContent = city;
    newBtn.setAttribute('class', "w-100 my-1 text-light border-2 bg-secondary rounded-pill");
    document.body.children[1].children[0].children[2].appendChild(newBtn);
    newBtn.addEventListener('click', function() {findForecast(city)});
}

function findForecast(reportName) {
    console.log("find function passed")
    var storedArray = JSON.parse(localStorage.getItem('reports'));
    for (n = 0; n < storedArray.length; n++) {
        if (reportName == storedArray[n].city.name) {
            loadForecast(storedArray[n]);
        }
    }
}