
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
        .then(response => response.json())
        .then(function (data) {
            console.log(data.tickers[0].last)
            $('#result').text(`1 ${data.id} is ${data.tickers[0].last} USD`);
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

    var apiCall = coinGeckoBase + 'coins/' + userInput1 + '?localization=false';
    console.log(apiCall)
    retrievePrice1(apiCall);
});

$(document).ready(function(){
    $('input.autocomplete').autocomplete({
      data: {
        "bitcoin": null,
      },
    });
  });

// *******
// ON-LOAD
// *******
$('#currency2-input').val('USD')