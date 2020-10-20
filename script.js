//global variable declarations
var city = '';
var state = '';
var zipcode = '';
var cityState;
var lastSearchedCity = {lat: '', lng: '', cityState: ''};
var lat = '';
var lng = '';
var searchedCities = [];
var mapquestKey = '2fxFW8D2Nq1hc5MzZjrjZGbt2a93eN2x';
var weatherKey = '01c9b567a2949d0d105c4324ffb34378';
var mapquestURL;
var weatherURL;
var searchBtn = $('#search');
var cityInput = $('#cityInput');
var stateInput = $('#stateInput');
var zipcodeInput = $('#zipcodeInput');
var uvi = $('#currentUVIndex');



//if there are searched cities saved in local storage, set searchedCities equal to cities saved in local storage
if ((localStorage.getItem('localStorageSearchedCities')) !== null) {
    searchedCities = JSON.parse(localStorage.getItem('localStorageSearchedCities'));
}

initializeDashboard();

//display button for each city stored in local storage on page load
createCityBtns(searchedCities);



//function to initialize dashboard with data from last searched city
function initializeDashboard(){
    
    if ((localStorage.getItem('localStorageLastSearchedCity')) !== '{"lat":"","lng":"","cityState":""}' && (localStorage.getItem('localStorageLastSearchedCity')) !== null) {

        lastSearchedCity = JSON.parse(localStorage.getItem('localStorageLastSearchedCity'));
        
        //set lat, lng, and cityState equal to lastSearchedCity information stored in local storage
        lat = lastSearchedCity.lat;
        lng = lastSearchedCity.lng;
        cityState = lastSearchedCity.cityState;

        //passes lat, lng, and weatherKey to openweather url
        weatherURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lng + '&units=imperial&exclude=minutely,hourly,alerts&appid=' + weatherKey;

        //passes weatherURL to callOpenWeatherApi function
        callOpenWeatherApi(weatherURL);

    }

}//end function initializeDashboard



//function to convert unix time to mm/dd/yyyy format
function returnTime(unixTime) {
    var date = new Date(unixTime * 1000);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();

    var fullDate = month + '/' + day + '/' + year;

    return fullDate;
}; //end function returnTime



//function to display current weather on the dashboard
function displayCurrentWeather(currentWeather) {

    console.log('currentWeather: ', currentWeather);

    //variable declarations
    var icon;
    var iconSrc;

    //calls returnTime function to convert unix time to mm/dd/yyyy format for display on dashboard
    var time = returnTime(currentWeather.dt);

    //displays city and date to first line of dashboard
    $('#city').text(cityState);
    $('#city').append(' ' + '(' + time + ')');

    //appends weather icon to first line of dashboard
    icon = currentWeather.weather[0].icon;
    iconSrc = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
    $('#city').append('<span><img src="' + iconSrc + '" alt="sun" id="currentIcon"></span>');

    //displays current temp, humidity, wind speed, and uvi to dashboard
    $('#currentTemp').append(currentWeather.temp + ' &#8457;');
    $('#currentHumidity').append(currentWeather.humidity + '%');
    $('#currentWindSpeed').append(currentWeather.wind_speed + ' MPH');
    uvi.append(currentWeather.uvi);
    
    //conditional to determine the background color of the uvi data based on the current uvi
    if (currentWeather.uvi >= 1 && currentWeather.uvi < 3) {
        uvi.css('background-color', 'green');
        uvi.css('color', 'white');
    } else if (currentWeather.uvi >= 3 && currentWeather.uvi < 6) {
        uvi.css('background-color', 'yellow');
    } else if (currentWeather.uvi >= 6 && currentWeather.uvi < 8) {
        uvi.css('background-color', 'orange');
        uvi.css('color', 'white');
    } else if (currentWeather.uvi >= 8 && currentWeather.uvi < 11) {
        uvi.css('background-color', 'red');
        uvi.css('color', 'white');
    } else if (currentWeather.uvi >= 11) {
        uvi.css('background-color', 'purple');
        uvi.css('color', 'white'); 
    }

} //end function displayCurrentWeather



//function to display 5 day forcast for searched city
function displayForecast(forecast){
    var day;
    var dayId;
    var icon;
    var iconId;
    var iconSrc;
    var high;
    var highId;
    var low;
    var lowId;


    //loop to diaplay date, weather icon, high, and low temp in cards for 5 day forecast
    for(var i = 0; i < 5; i++){

        day = returnTime(forecast[i].dt);
        dayId = '#day' + i;
        $(dayId).text(day);

        icon = forecast[i].weather[0].icon;
        iconSrc = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
        iconId = '#weatherIcon' + i;
        $(iconId).attr('src', iconSrc);

        high = 'High: ' + forecast[i].temp.max;
        highId = '#high' + i;
        $(highId).text(high);
        $(highId).append(' &#8457;');

        low = 'Low: ' + forecast[i].temp.min;
        lowId = '#low' + i;
        $(lowId).text(low);
        $(lowId).append(' &#8457;');

    }//end for loop

    //display weather
    $('.cityWeather').css('visibility', 'visible');

} //end function displayForecast



//function to clear all data from application
function resetData() {
    mapquestURL = '';
    lat = '';
    lng = '';
    $('#city').empty();
    $('#currentTemp').empty();
    $('#currentHumidity').empty();
    $('#currentWindSpeed').empty();
    uvi.empty();
    uvi.css('background-color', 'transparent');
    uvi.css('color', 'black');
    
} //end resetData


//function to clear input fields after user clicks search button
function clearInputFields() {
    zipcodeInput.val('');
    cityInput.val('');
    stateInput.val('');
} //end clearInputFields


//function to create buttons for cities that the user has previously searched
function createCityBtns(searchedCities) {

    //empties city button div
    $('.cityBtns').empty();

    //variable declarations
    var searchedCity;
    var searchedState;
    var searchedCityState;

    //for loop to create a button for each city stored in the searchedCities array
    for (var i = 0; i < searchedCities.length; i++){
        
        searchedCity = searchedCities[i].city;
        searchedState = searchedCities[i].state;
        searchedCountry = searchedCities[i].country;

        //if city is located in US, display state code with city
        //if city is international, display country code with city
        if (searchedCities[i].country === 'US'){
            searchedCityState = searchedCity + ', ' + searchedState;
        } else {
            searchedCityState = searchedCity + ', ' + searchedCountry;
        }

        //append button to city btns div
        $('.cityBtns').append('<button type="button" class="btn btn-light btn-block cityBtn" data-city="' + searchedCity + '" data-state="' + searchedState + '">' + searchedCityState + '</button>');
    }//end for loop

}//end function createCityBtns



//function to ensure that new buttons are not created for cities that already have a button
function removeDuplicateCities(searchedCities) {

    //converts cities array to a string
    var jsonCities = searchedCities.map(JSON.stringify);

    //converts string to a set (doesn't allow repeats)
    var nonDuplicateCitiesSet = new Set(jsonCities);
    
    //converts string of nonduplicate cities back to array
    var nonDuplicateCitiesArray = Array.from(nonDuplicateCitiesSet).map(JSON.parse);
    
    //returns array
    return nonDuplicateCitiesArray;

}//end function removeDuplicateCities


//function to call the openweather api
function callOpenWeatherApi(weatherURL){

    $.ajax({
        url: weatherURL,
        method: "GET"
    }).then(function(response) {

        console.log('response:', response)
        
        //creates array that stores current weather response from openweather api and passes to displayCurrentWeather function
        var currentWeather = response.current;
        displayCurrentWeather(currentWeather);

        //creates array that stores the weather forecast response from openweather api and passes to displayForecast function
        //removes first index in forecast array (first index is current day)
        var forecast = response.daily;
        forecast.splice(0, 1);
        displayForecast(forecast);
        
    }); //end ajax call to openweather api

}//end function callOpenWeatherApi



//on click event for search button
searchBtn.on('click', function(event){
    event.preventDefault();

    resetData();

    //pulls input from city input field
    city = cityInput.val().trim();
    city = city.replace(' ', '%20');

    //pulls input from state input field
    state = stateInput.val().trim();
    state = state.replace(' ', '%20');

    //pulls input from zipcode input field
    zipcode = zipcodeInput.val().trim();
    zipcode = parseInt(zipcode);

    //clear input field when search btn is clicked
    clearInputFields();

    //if the user entered a valid numeric zipcode, use zipcode as search parameter with mapquest url
    //if user entered a city, use the city as search parameter with mapquest url
    //if user doesn't enter valid zipcode or city, display an error message
    if (zipcode !== '' && isNaN(zipcode) === false) {
        mapquestURL = 'https://www.mapquestapi.com/geocoding/v1/address?key=' + mapquestKey + '&postalCode=' + zipcode;
    } else if (city !== '') {
        mapquestURL = 'https://www.mapquestapi.com/geocoding/v1/address?key=' + mapquestKey + '&city=' + city + '&state=' + state;
    } else {
        $('#errorMessage').css('display', 'block');
        $('.cityWeather').css('visibility', 'hidden');
        console.log('url', mapquestURL);
    }


    //if the mapquest url was created, run the ajax call to the mapquest api
    if (mapquestURL !== '') {
        $.ajax({
            url: mapquestURL,
            method: "GET"
        }).then(function(response) {
            //clear error message after ajax call to mapquest api is run
            $('#errorMessage').css('display', 'none');
            
            //pull lat, lng, city, state, and country from mapquest api response
            lat = response.results[0].locations[0].latLng.lat;
            lng = response.results[0].locations[0].latLng.lng;
            city = response.results[0].locations[0].adminArea5;
            state = response.results[0].locations[0].adminArea3;
            country = response.results[0].locations[0].adminArea1;

            //sets last searched lat and lng variables
            lastSearchedCity.lat = lat;
            lastSearchedCity.lng = lng;

            var searchObject = {}

            //if the location is in the US, set cityState to city, state and create object with city, state, and country
            //if the location is international, set cityState to city, country and create an object with the city and country but a blank state
            if (country === 'US') {
                cityState = city + ', ' + state;
                lastSearchedCity.cityState = city + ', ' + state;
                searchObject = {city: city, state: state, country: country};
                searchedCities.push(searchObject);
            } else {
                cityState = city + ', ' + country;
                lastSearchedCity.cityState = city + ', ' + country;
                searchObject = {city: city, state: '', country: country};
                searchedCities.push(searchObject);
            }

            //ensures a duplicate city was not entered
            searchedCities = removeDuplicateCities(searchedCities);

            //stores searchedCities in local storage
            localStorage.setItem('localStorageSearchedCities', JSON.stringify(searchedCities));
            localStorage.setItem('localStorageLastSearchedCity', JSON.stringify(lastSearchedCity));

            //creates buttons for each searchedCity
            createCityBtns(searchedCities);


            //if lat and lng are not empty, pass lat and lng coordinates to openweather url and run ajax call to openweather api
            if (lat !== '' && lng !== '') {
                weatherURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lng + '&units=imperial&exclude=minutely,hourly,alerts&appid=' + weatherKey; 
        
                //passes weatherURL to callOpenWeatherApi function
                callOpenWeatherApi(weatherURL);

            }//end inner if statement
        });//end ajax call to mapquest url
    }//end outer if statement


}); //end searchBtn onclick event

//onclick event for city buttons
$('body').delegate('.cityBtn', 'click', function(event) {
    event.preventDefault();

    resetData();

    //pulls city and state from dataset stored with each button element
    city = this.dataset.city;
    city = city.replace(' ', '%20');
    state = this.dataset.state;

    //passes city and state from button to mapquest url
    mapquestURL = 'https://www.mapquestapi.com/geocoding/v1/address?key=' + mapquestKey + '&city=' + city + '&state=' + state;

    $.ajax({
        url: mapquestURL,
        method: "GET"
    }).then(function(response) {

        //pull lat, lng, city, state, and country from mapquest api response
        lat = response.results[0].locations[0].latLng.lat;
        lng = response.results[0].locations[0].latLng.lng;
        city = response.results[0].locations[0].adminArea5;
        state = response.results[0].locations[0].adminArea3;
        country = response.results[0].locations[0].adminArea1;

        //sets last searched lat and lng variables
        lastSearchedCity.lat = lat;
        lastSearchedCity.lng = lng;

        //if location is in US, set cityState to city, state
        //if location is international, set cityState to city, country
        if (country === 'US') {
            cityState = city + ', ' + state;
            lastSearchedCity.cityState = city + ', ' + state;
            
        } else {
            cityState = city + ', ' + country; 
            lastSearchedCity.cityState = city + ', ' + country;
        }

        //passes last searched city to local storage
        localStorage.setItem('localStorageLastSearchedCity', JSON.stringify(lastSearchedCity));

        //passees lat and lng coordinates from mapquest api to openweather url
        weatherURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lng + '&units=imperial&exclude=minutely,hourly,alerts&appid=' + weatherKey; 

        //passes weatherURL to callOpenWeatherApi function
        callOpenWeatherApi(weatherURL);

    }); //end mapquest api call
        
});//end city btn on click event



//click event for clearCities button
$('#clearCities').on('click', function(event){
    event.preventDefault();

    //clears searchedCities array and lastSearchedcity object
    searchedCities = [];
    lastSearchedCity = {lat: '', lng: '', cityState: ''};

    //clears local storage by passing empty array to local storage
    localStorage.setItem('localStorageSearchedCities', JSON.stringify(searchedCities));
    localStorage.setItem('localStorageLastSearchedCity', JSON.stringify(lastSearchedCity));

    //clears city buttons by passing empty array to createCityBtns function
    createCityBtns(searchedCities);

}); //end clearCities on click 

