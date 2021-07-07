
// ****************
// GLOBAL VARIABLES
// ****************

var currentVal = $("#currentVal");
var summary = $("#adlInfo");

var currency1 = '';
var currency2 = 'USD';

// CoinGecko API
var coinGeckoBase = 'https://api.coingecko.com/api/v3/';
var coinObject = {};
// fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false')
//     .then(response => response.json())
//     .then(function (data) {
//         coinObject = data;
//         console.log(data);
//     });


// *********
// FUNCTIONS
// *********

function retrievePrice(api, first, second) {
    fetch(api)
        .then(response => response.json())
        .then(function (data) {
            var vs_currencies = data[first];
            var val = (vs_currencies[second])
            $('#second-currency-amount').val(val);
        });
};



// ***************
// EVENT LISTENERS
// ***************
$('#currency1-input').bind('change', function(event) {
    event.preventDefault();

    // alert user if input is invalid

    // ping API using user input
    var userInput1 = $('#currency1-input').val();
    var userInput2 = $('#currency2-input').val();

    var apiCall = coinGeckoBase + 'simple/price?ids=' + userInput1 + '&vs_currencies=' + userInput2;
    console.log(apiCall)
    retrievePrice(apiCall, userInput1, userInput2.toLowerCase());
});

// materialize listeners
$(document).ready(function(){
   $('select').formSelect();
});

// *******
// ON LOAD
// *******

// default inputs
$('#first-currency-amount').val(1);
$('#currency2-input').val('USD');