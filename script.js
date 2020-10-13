var city = '';
var state = '';
var zipcode = '';
var cityState;
var lat = '';
var lng = '';
var mapquestKey = '2fxFW8D2Nq1hc5MzZjrjZGbt2a93eN2x';
var weatherKey = '01c9b567a2949d0d105c4324ffb34378';
var mapquestURL;
var weatherURL;
var searchBtn = $('#search');
var cityInput = $('#cityInput');
var stateInput = $('#stateInput');
var zipcodeInput = $('#zipcodeInput');


var date = returnTime(1603130400);
console.log('date:', date)


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

    $('#currentTemp').append(currentWeather.temp + ' &#8457;');
    $('#currentHumidity').append(currentWeather.humidity + '%');
    $('#currentWindSpeed').append(currentWeather.wind_speed + ' MPH');
    $('#currentUVIndex').append(currentWeather.uvi);
    
    if (currentWeather.uvi >= 1 && currentWeather.uvi < 3) {
        $('#currentUVIndex').css('background-color', 'green');
        $('#currentUVIndex').css('color', 'white');
    } else if (currentWeather.uvi >= 3 && currentWeather.uvi < 6) {
        $('#currentUVIndex').css('background-color', 'yellow');
    } else if (currentWeather.uvi >= 6 && currentWeather.uvi < 8) {
        $('#currentUVIndex').css('background-color', 'orange');
        $('#currentUVIndex').css('color', 'white');
    } else if (currentWeather.uvi >= 8 && currentWeather.uvi < 11) {
        $('#currentUVIndex').css('background-color', 'red');
        $('#currentUVIndex').css('color', 'white');
    } else if (currentWeather.uvi >= 11) {
        $('#currentUVIndex').css('background-color', 'purple');
        $('#currentUVIndex').css('color', 'white'); 
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



searchBtn.on('click', function(event){
    event.preventDefault;

    resetData();

    // mapquestURL = '';
    // lat = '';
    // lng = '';

    city = cityInput.val().trim();
    city = city.replace(' ', '%20');

    state = stateInput.val().trim();
    state = state.replace('', '%20');

    zipcode = zipcodeInput.val().trim();

    clearInputFields();

    if (zipcode !== ''){
        mapquestURL = 'http://www.mapquestapi.com/geocoding/v1/address?key=' + mapquestKey + '&postalCode=' + zipcode;
    } else if (city !== '' && state !== '') {
        mapquestURL = 'http://www.mapquestapi.com/geocoding/v1/address?key=' + mapquestKey + '&city=' + city + '&state=' + state;
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
            // console.log('response', response.results[0]);
            lat = response.results[0].locations[0].latLng.lat;
            lng = response.results[0].locations[0].latLng.lng;
            city = response.results[0].locations[0].adminArea5;
            state = response.results[0].locations[0].adminArea3;

            if (state !== '') {
                cityState = city + ', ' + state;
            } else {
                cityState = city;
            }
            
            // console.log('cityState:', cityState)

            if (lat !== '' && lng !== '') {
                weatherURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lng + '&units=imperial&exclude=minutely,hourly,alerts&appid=' + weatherKey; 
                console.log('weatherURL:', weatherURL)
        
                $.ajax({
                    url: weatherURL,
                    method: "GET"
                }).then(function(response) {
                    
                    // console.log('response', response);
                    var currentWeather = response.current;
                    // console.log('currentWeather:', currentWeather)
                    displayCurrentWeather(currentWeather);
                    
                })
            }
        });
    }


});

