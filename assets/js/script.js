
// ****************
// GLOBAL VARIABLES
// ****************

var currentVal = $("#currentVal");
var summary = $("#adlInfo");

var currency1 = '';
var currency2 = 'USD';

// CoinGecko API
var coinGeckoBase = 'https://api.coingecko.com/api/v3/';


// *********
// FUNCTIONS
// *********

function retrievePrice1(api) {
    fetch(api)
        .then(response => response.json)
        .then(function (data) {
            console.log(data)
        });
};



// ***************
// EVENT LISTENERS
// ***************
$('#currency1form').on('submit', function(event) {
    event.preventDefault();

    // alert user if input is invalid

    // ping API using user input
    var userInput1 = $('#currency1-input').val();

    var apiCall = coinGeckoBase + 'coins/' + userInput1;
    console.log(apiCall)
    retrievePrice1(apiCall);
});