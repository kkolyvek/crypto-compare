// ****************
// GLOBAL VARIABLES
// ****************

var currentVal = $("#currentVal");
var summary = $("#adlInfo");

var currency1 = '';
var currency2 = 'USD';

var datepicker = moment();

// CoinGecko API
var coinGeckoBase = 'https://api.coingecko.com/api/v3/';

// Data from CoinGecko frequently accessed
if (!localStorage.getItem('coinObject') || !localStorage.getItem('coinObjectRef')) {
    var coinObject = {}; // object of coins for materialize autocomplete
    var coinObjectRef = {}; // object of names and ids for cleaner visuals
    fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false')
        .then(response => response.json())
        .then(function (data) {
            for (var i=0; i<data.length; i++) {
                coinObject[data[i].name] = null;
                coinObjectRef[data[i].name] = data[i].id;
            };

            localStorage.setItem('coinObject', JSON.stringify(coinObject));
            localStorage.setItem('coinObjectRef', JSON.stringify(coinObjectRef));
        });
} else {
    var coinObject = JSON.parse(localStorage.getItem('coinObject'));
    var coinObjectRef = JSON.parse(localStorage.getItem('coinObjectRef'));
};

// Frankfurter API
var frankfurterBase = 'https://api.frankfurter.app/';

// Data from Frankfurter frequently accessed
if (!localStorage.getItem('currencyObject') || !localStorage.getItem('currencyObjectRef')) {
    var currencyObject = {}; // object of currencies for materialize autocomplete
    var currencyObjectRef = {}; // object of tickers for later api calls
    fetch(frankfurterBase + 'currencies')
        .then(response => response.json())
        .then(function (data) {
            for (var i=0; i<Object.values(data).length; i++) {
                currencyObject[Object.values(data)[i]] = null;
                currencyObjectRef[Object.values(data)[i]] = Object.keys(data)[i];
            };

            localStorage.setItem('currencyObject', JSON.stringify(currencyObject));
            localStorage.setItem('currencyObjectRef', JSON.stringify(currencyObjectRef));
        });
} else {
    var currencyObject = JSON.parse(localStorage.getItem('currencyObject'));
    var currencyObjectRef = JSON.parse(localStorage.getItem('currencyObjectRef'));
};


// *********
// FUNCTIONS
// *********

function retrievePrice(api, first, second) {
    fetch(api)
        .then(response => response.json())
        .then(function (data) {
            var vs_currencies = data[first];
            var val = (vs_currencies[second])
            $('#second-currency-amount').val(val * $('#first-currency-amount').val());
        });
};



// ***************
// EVENT LISTENERS
// ***************
// TODO: improve this event listener to fire when clicking on an autocomplete item
$('#currency1-input').on('input', function(event) {
    event.preventDefault();

    // TODO: made this if statement more robust to allow non case sensitive inputs
    if (coinObject.hasOwnProperty($('#currency1-input').val()) && $('#first-currency-amount').val()) {
        var userInput1 = coinObjectRef[$('#currency1-input').val()];
        var userInput2 = $('#currency2-input').val();
    
        var apiCall = coinGeckoBase + 'simple/price?ids=' + userInput1 + '&vs_currencies=' + userInput2;
        retrievePrice(apiCall, userInput1, userInput2.toLowerCase());
    } else {
        $('#second-currency-amount').val('');
    };
});

// materialize listeners
$(document).ready(function(){
   $('select').formSelect();
});

$(document).ready(function(){
    $('input.autocomplete').autocomplete({
      data: coinObject
    });
  });


// *******
// ON LOAD
// *******

// default inputs
$('#first-currency-amount').val(1);
$('#currency2-input').val('usd');

// cmm - for date picker on my card
$(document).ready(function(){
  $('.datepicker').datepicker();
});

//Code for creating card to display price information:

var trendingURL = "https://api.coingecko.com/api/v3/search/trending"

function generateTrending (){
    fetch (trendingURL)
    .then(res => {
        // console.log(res);
        return res.json();
    })
    .then(top7 => {
        console.log(top7);
        for (let i = 0; i < top7.coins.length; i++){
            // console.log(top7.coins[i].item.name)
            $('#trend').append('<li>' + top7.coins[i].item.name + '</li>')
        }
    })
}

generateTrending();
