var city = '';
var state = '';
var zipcode = '';
var cityState;
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


if ((localStorage.getItem('localStorageSearchedCities')) !== null) {
    searchedCities = JSON.parse(localStorage.getItem('localStorageSearchedCities'));
}


createCityBtns(searchedCities);


function returnTime(unixTime) {
    var date = new Date(unixTime * 1000);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();

    var fullDate = month + '/' + day + '/' + year;

    return fullDate;
};

function displayCurrentWeather(currentWeather) {
    $('#city').text(cityState);
    console.log('currentWeather', currentWeather);
    var time = returnTime(currentWeather.dt);
    $('#city').append(' ' + '(' + time + ')');
    $('#city').append('<span><img src="sun.jpg" alt="sun" id="currentIcon"></span>');

    $('#currentTemp').append(currentWeather.temp + ' &#8457;');
    $('#currentHumidity').append(currentWeather.humidity + '%');
    $('#currentWindSpeed').append(currentWeather.wind_speed + ' MPH');
    uvi.append(currentWeather.uvi);
    
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
}

function displayForecast(forecast){
    var day;
    var dayId;

    for(var i = 0; i < 5; i++){

        day = returnTime(forecast[i].dt);
        dayId = '#day' + i;
        $(dayId).text(day);

        high = 'High: ' + forecast[i].temp.max;
        highId = '#high' + i;
        $(highId).text(high);
        $(highId).append(' &#8457;');

        low = 'Low: ' + forecast[i].temp.min;
        lowId = '#low' + i;
        $(lowId).text(low);
        $(lowId).append(' &#8457;');
    }

}

function resetData() {
    mapquestURL = '';
    lat = '';
    lng = '';
    $('#city').empty();
    $('#currentTemp').empty();
    $('#currentHumidity').empty();
    $('#currentWindSpeed').empty();
    $('#currentUVIndex').empty();
    $('#currentUVIndex').css('background-color', 'transparent');
    $('#currentUVIndex').css('color', 'black');
}

function clearInputFields() {
    zipcodeInput.val('');
    cityInput.val('');
    stateInput.val('');
}

function createCityBtns(searchedCities) {

    $('.cityBtns').empty();

    var searchedCity;
    var searchedState;
    var searchedCityState;

    for (var i = 0; i < searchedCities.length; i++){
        
        searchedCity = searchedCities[i].city;
        searchedState = searchedCities[i].state;

        if (searchedCities[i].country === 'US'){
            searchedCityState = searchedCity + ', ' + searchedState;
        } else {
            searchedCityState = searchedCity;
        }

        $('.cityBtns').append('<button type="button" class="btn btn-light btn-block cityBtn" data-city="' + searchedCity + '" data-state="' + searchedState + '">' + searchedCityState + '</button>');
    }
}



searchBtn.on('click', function(event){
    event.preventDefault;

    resetData();

    // mapquestURL = '';
    // lat = '';
    // lng = '';

    city = cityInput.val().trim();
    city = city.replace(' ', '%20');

    state = stateInput.val().trim();
    state = state.replace(' ', '%20');

    zipcode = zipcodeInput.val().trim();


    clearInputFields();


    if (zipcode !== '') {
        mapquestURL = 'http://www.mapquestapi.com/geocoding/v1/address?key=' + mapquestKey + '&postalCode=' + zipcode;
    } else if (city !== '') {
        mapquestURL = 'http://www.mapquestapi.com/geocoding/v1/address?key=' + mapquestKey + '&city=' + city + '&state=' + state;
        console.log('mapquestURL:', mapquestURL)
    } else {
        $('#errorMessage').css('display', 'block');
        console.log('url', mapquestURL);
    }


    if (mapquestURL !== '') {
        $.ajax({
            url: mapquestURL,
            method: "GET"
        }).then(function(response) {
            $('#errorMessage').css('display', 'none');
            
            lat = response.results[0].locations[0].latLng.lat;
            lng = response.results[0].locations[0].latLng.lng;
            city = response.results[0].locations[0].adminArea5;
            state = response.results[0].locations[0].adminArea3;
            country = response.results[0].locations[0].adminArea1;

            var searchObject = {}

            if (country === 'US') {
                cityState = city + ', ' + state;
                searchObject = {city: city, state: state, country: country};
                searchedCities.push(searchObject);
            } else {
                cityState = city;
                searchObject = {city: city, state: '', country: country};
                searchedCities.push(searchObject);
            }

            console.log('searchedCities: ', searchedCities);
            localStorage.setItem('localStorageSearchedCities', JSON.stringify(searchedCities));
            createCityBtns(searchedCities);


            

            if (lat !== '' && lng !== '') {
                weatherURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lng + '&units=imperial&exclude=minutely,hourly,alerts&appid=' + weatherKey; 
                console.log('weatherURL:', weatherURL)
        
                $.ajax({
                    url: weatherURL,
                    method: "GET"
                }).then(function(response) {
                    
                    
                    
                    var currentWeather = response.current;
                    
                    displayCurrentWeather(currentWeather);

                    var forecast = response.daily;
                    

                    forecast.splice(0, 1);
                    console.log('forecast:', forecast);
                    displayForecast(forecast);

                    
                    
                })
            }
        });
    }


});

