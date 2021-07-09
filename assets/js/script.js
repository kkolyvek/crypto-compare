// ****************************
// INITIALIZE MATERIALIZE ITEMS
// ****************************
// "loading" modal
$('.modal').modal({
    dismissible: false
});
$('#loading-modal').modal('open');
$('.tooltipped').tooltip();

// autocomplete inputs
$('#currency1-input').autocomplete({
    data: combinedObject,
    onAutocomplete: function() {
        var firstCurrAmount = $('#first-currency-amount').val();
        var firstCurr = $('#currency1-input').val();
        var secondCurrAmount = $('#second-currency-amount').val();
        var secondCurr = $('#currency2-input').val();
        compareInputs(firstCurrAmount, firstCurr, secondCurrAmount, secondCurr, 1);
    }
});
$('#currency2-input').autocomplete({
    data: combinedObject,
    onAutocomplete: function() {
        var firstCurrAmount = $('#first-currency-amount').val();
        var firstCurr = $('#currency1-input').val();
        var secondCurrAmount = $('#second-currency-amount').val();
        var secondCurr = $('#currency2-input').val();
        compareInputs(firstCurrAmount, firstCurr, secondCurrAmount, secondCurr, 2);
    }
});

// ****************
// GLOBAL VARIABLES
// ****************

// CoinGecko API
var coinGeckoBase = 'https://api.coingecko.com/api/v3/';
// Frankfurter API
var frankfurterBase = 'https://api.frankfurter.app/';

// Fetch autocomplete and API variables
var coinObject = {}; // object of coins for materialize autocomplete
var coinObjectRef = {}; // object of names and ids for cleaner visuals
var currencyObject = {}; // object of currencies for materialize autocomplete
var currencyObjectRef = {}; // object of tickers for later api calls
var combinedObject = {}; // object of the two apis combined
var combinedObjectRef = {}; // object of the two reference objects combined
// Grab data and set to local storage, or grab from local storage
if (!localStorage.getItem('coinObject') || !localStorage.getItem('coinObjectRef') || !localStorage.getItem('currencyObjectRef') || !localStorage.getItem('currencyObjectRef')) {
    fetch(coinGeckoBase + 'coins/list?include_platform=false')
        .then(response => response.json())
        .then(function (data) {
            for (var i=0; i<data.length; i++) {
                coinObject[data[i].name] = null;
                coinObjectRef[data[i].name.toLowerCase()] = data[i].id;
            };
            // Data from Frankfurter
            fetch(frankfurterBase + 'currencies')
            .then(response => response.json())
            .then(function (data) {
                for (var i=0; i<Object.values(data).length; i++) {
                    currencyObject[Object.values(data)[i]] = null;
                    currencyObjectRef[Object.values(data)[i].toLowerCase()] = Object.keys(data)[i];
                };
    
                combinedObject = {
                    ...coinObject,
                    ...currencyObject
                };
                combinedObjectRef = {
                    ...coinObjectRef,
                    ...currencyObjectRef
                };
    
                // Once all data is loaded, add to autocmplete, proceed to the site, and save to local storage
                $('.autocomplete').autocomplete('updateData', combinedObject);
                $('#loading-modal').modal('close');
    
                localStorage.setItem('coinObject', JSON.stringify(coinObject));
                localStorage.setItem('coinObjectRef', JSON.stringify(coinObjectRef));
                localStorage.setItem('currencyObject', JSON.stringify(currencyObject));
                localStorage.setItem('currencyObjectRef', JSON.stringify(currencyObjectRef));
                localStorage.setItem('combinedObject', JSON.stringify(combinedObject));
                localStorage.setItem('combinedObjectRef', JSON.stringify(combinedObjectRef));
            });
        });
} else {
    coinObject = JSON.parse(localStorage.getItem('coinObject'));
    coinObjectRef = JSON.parse(localStorage.getItem('coinObjectRef'));
    currencyObject = JSON.parse(localStorage.getItem('currencyObject'));
    currencyObjectRef = JSON.parse(localStorage.getItem('currencyObjectRef'));
    
    combinedObject = {
        ...coinObject,
        ...currencyObject
    };
    combinedObjectRef = {
        ...coinObjectRef,
        ...currencyObjectRef
    };

    // Once all data is loaded, add to autocmplete, proceed to the site, and save to local storage
    $('.autocomplete').autocomplete('updateData', combinedObject);
    $('#loading-modal').modal('close');
};


// *******
// ON LOAD
// *******

// default inputs
$(document).ready(function(){
    // fill default values for inputs
    $('#first-currency-amount').val(1);
    $('#currency2-input').val('United States Dollar');
    // disable the buttons by default
    $('#btn1').addClass('disabled');
    $('#btn2').addClass('disabled');
    
    // generate top 7 trending
    generateTrending();
});



// *********
// FUNCTIONS
// *********

function compareInputs(amount1, input1, amount2, input2, updatedSide) {
    // Generates and executes required API calls based on origin of requested data

    // make both inputs all lowercase to control for case sensitivity
    input1 = input1.toLowerCase();
    input2 = input2.toLowerCase();

    // if either input is a CoinGecko data - enable market data button
    if (coinObjectRef.hasOwnProperty(input1)) {
        $('#btn1').removeClass('disabled');
    } else {
        $('#btn1').addClass('disabled');
    };
    if (coinObjectRef.hasOwnProperty(input2)) {
        $('#btn2').removeClass('disabled');
    } else {
        $('#btn2').addClass('disabled');
    };

    // Check to see if the inputs are valid and 1 of 2 amounts is filled - otherwise APIs can't be called
    if (!combinedObjectRef.hasOwnProperty(input1) || !combinedObjectRef.hasOwnProperty(input2)) {
        return
    };
    if (!amount1 && !amount2) {
        return
    };

    // If the two inputs are the same, no API call needs to be made
    if (input1 === input2) {
        // set opposing amount to inputted amount
        if (updatedSide === 1) {
            $('#second-currency-amount').val(amount1);
        } else {
            $('#first-currency-amount').val(amount2);
        };
        return
    }

    // locate each input's source
    var origins = []; // index 0 is first input, index 1 is second input -- and inputs in USD will be 'usd'
    if (combinedObjectRef[input1] === 'USD') {
        origins[0] = 'usd';
    } else if (coinObjectRef.hasOwnProperty(input1)) {
        origins[0] = 'CoinGecko';
    } else {
        origins[0] = 'Frankfurter';
    };
    if (combinedObjectRef[input2] === 'USD') {
        origins[1] = 'usd';
    } else if (coinObjectRef.hasOwnProperty(input2)) {
        origins[1] = 'CoinGecko';
    } else {
        origins[1] = 'Frankfurter';
    };
    if (combinedObjectRef[input1] === 'USD') {
        // CASE WHERE FIRST INPUT IS IN USD - ONLY 1 API CALL REQUIRED
        if (origins[1] === 'CoinGecko') {
            // IF the second input is from CoinGecko, THEN structure a call to their api
            var userInput = coinObjectRef[input2];
            var APICall = coinGeckoBase + 'simple/price?ids=' + userInput + '&vs_currencies=usd';
            retrieveSingleCG(APICall, 'usd', input2, amount1, amount2, updatedSide);
        } else {
            // ELSE, the second input is from Frankfurter. Structure a call to their api
            var userInput = currencyObjectRef[input2];
            var APICall = frankfurterBase + 'latest?from=' + userInput + '&to=USD';
            retrieveSingleF(APICall, 'usd', input2, amount1, amount2, updatedSide);
        };
    } else if (combinedObjectRef[input2] === 'USD') {
        // CASE WHERE SECOND INPUT IS IN USD - ONLY 1 API CALL REQUIRED
        if (origins[0] === 'CoinGecko') {
            // IF the first input is from CoinGecko, THEN structure a call to their api
            var userInput = coinObjectRef[input1];
            var APICall = coinGeckoBase + 'simple/price?ids=' + userInput + '&vs_currencies=usd';
            retrieveSingleCG(APICall, input1, 'usd', amount1, amount2, updatedSide);
        } else {
            // ELSE, the first input is from Frankfurter. Structure a call to their api
            var userInput = currencyObjectRef[input1];
            var APICall = frankfurterBase + 'latest?from=' + userInput + '&to=USD';
            retrieveSingleF(APICall, input1, 'usd', amount1, amount2, updatedSide);
        };
    } else {
        // CASE WHERE BOTH INPUTS ARE NOT USD - TWO API CALLS REQUIRED

        retrieveDouble(origins, input1, input2, amount1, amount2, updatedSide);
    };
};

function retrieveSingleCG(api, inputFirst, inputSecond, amountFirst, amountSecond, updatedSide) {
    if (inputFirst === 'usd') {
        // first input is USD
        fetch(api)
            .then(response => response.json())
            .then(function (data) {
                var vs_currency = data[combinedObjectRef[inputSecond]];
                var val_input2_USD = vs_currency['usd'];
                if (updatedSide === 1) {
                    $('#second-currency-amount').val(amountFirst * 1 / val_input2_USD);
                } else {
                    $('#first-currency-amount').val(amountSecond * val_input2_USD);
                };
            });
    } else {
        // second input is USD
        fetch(api)
            .then(response => response.json())
            .then(function (data) {
                var vs_currency = data[combinedObjectRef[inputFirst]];
                var val_input1_USD = vs_currency['usd'];
                if (updatedSide === 1) {
                    $('#second-currency-amount').val(amountFirst * val_input1_USD);
                } else {
                    $('#first-currency-amount').val(amountSecond * 1 / val_input1_USD);
                };
            });
    };
};

function retrieveSingleF(api, inputFirst, inputSecond, amountFirst, amountSecond, updatedSide) {
    if (inputFirst === 'usd') {
        // first input is USD
        fetch(api)
            .then(response => response.json())
            .then(function (data) {
                var vs_currency = data['rates'];
                var val_input2_USD = vs_currency['USD'];
                if (updatedSide === 1) {
                    $('#second-currency-amount').val(amountFirst * 1 / val_input2_USD);
                } else {
                    $('#first-currency-amount').val(amountSecond * val_input2_USD);
                };
            });
    } else {
        // second input is USD
        fetch(api)
            .then(response => response.json())
            .then(function (data) {
                var vs_currency = data['rates'];
                var val_input1_USD = vs_currency['USD'];
                if (updatedSide === 1) {
                    $('#second-currency-amount').val(amountFirst * val_input1_USD);
                } else {
                    $('#first-currency-amount').val(amountSecond * 1 / val_input1_USD);
                };
            });
    };
};

function retrieveDouble(originArray, inputFirst, inputSecond, amountFirst, amountSecond, updatedSide) {
    var inputArray = [combinedObjectRef[inputFirst], combinedObjectRef[inputSecond]];
    var APICallArray = [];
    for (var i=0; i<2; i++) {
        if (originArray[i] === 'CoinGecko') {
            APICallArray[i] = coinGeckoBase + 'simple/price?ids=' + inputArray[i] + '&vs_currencies=usd';
        } else {
            APICallArray[i] = frankfurterBase + 'latest?from=' + inputArray[i] + '&to=USD';
        };
    };

    fetch(APICallArray[0])
        .then(response => response.json())
        .then(function (data) {
            if (originArray[0] === 'CoinGecko') {
                var vs_currency = data[inputArray[0]];
                var val_input1_USD = vs_currency['usd'];
            } else {
                var vs_currency = data['rates'];
                var val_input1_USD = vs_currency['USD'];
            };

            fetch(APICallArray[1])
                .then(response => response.json())
                .then(function (data2) {
                    if (originArray[1] === 'CoinGecko') {
                        var vs_currency = data2[inputArray[1]];
                        var val_input2_USD = vs_currency['usd'];
                    } else {
                        var vs_currency = data2['rates'];
                        var val_input2_USD = vs_currency['USD'];
                    };

                    // Once both currencies are fetched in terms of USD, calculate relative value and display
                    if (updatedSide === 1) {
                        var val2 = amountFirst * val_input1_USD / val_input2_USD;
                        $('#second-currency-amount').val(val2);
                    } else {
                        var val1 = amountSecond * val_input2_USD / val_input1_USD;
                        $('#first-currency-amount').val(val1);
                    };
                });
        });
};



// ***************
// EVENT LISTENERS
// ***************

$('#first-currency-amount').on('input', function(event) {
    event.preventDefault();
    var firstCurrAmount = $('#first-currency-amount').val();
    var firstCurr = $('#currency1-input').val();
    var secondCurrAmount = $('#second-currency-amount').val();
    var secondCurr = $('#currency2-input').val();
    compareInputs(firstCurrAmount, firstCurr, secondCurrAmount, secondCurr, 1);
});
$('#currency1-input').on('input', function(event) {
    event.preventDefault();
    var firstCurrAmount = $('#first-currency-amount').val();
    var firstCurr = $('#currency1-input').val();
    var secondCurrAmount = $('#second-currency-amount').val();
    var secondCurr = $('#currency2-input').val();
    compareInputs(firstCurrAmount, firstCurr, secondCurrAmount, secondCurr, 1);
});
$('#second-currency-amount').on('input', function(event) {
    event.preventDefault();
    var firstCurrAmount = $('#first-currency-amount').val();
    var firstCurr = $('#currency1-input').val();
    var secondCurrAmount = $('#second-currency-amount').val();
    var secondCurr = $('#currency2-input').val();
    compareInputs(firstCurrAmount, firstCurr, secondCurrAmount, secondCurr, 2);
});
$('#currency2-input').on('input', function(event) {
    event.preventDefault();
    var firstCurrAmount = $('#first-currency-amount').val();
    var firstCurr = $('#currency1-input').val();
    var secondCurrAmount = $('#second-currency-amount').val();
    var secondCurr = $('#currency2-input').val();
    compareInputs(firstCurrAmount, firstCurr, secondCurrAmount, secondCurr, 2);
});

// // //test button
// $('#currency1-input').on('input', function(event) {
//     event.preventDefault();
//     if($('#currency1-input').val()=);
// });
// // //test button


// ***************
// CARD GENERATION
// ***************
var formEl1 = document.getElementById("form1");
var btnEl1 = $("#btn1");

function getMarketData1(event){
    event.preventDefault();

    $('#card1').removeClass("hide");
    $('#marketSummary').html('');

    var mDT = $('#currency1-input').val();
    var mDTlower = mDT.toLowerCase();
    var mDTfinal = coinObjectRef[mDTlower];

    var marketDataURL ='https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids='+mDTfinal+ '&order=market_cap_desc%2Cvolume_desc&per_page=1&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d';
  
fetch(marketDataURL)
  .then(resm => {
      return resm.json();
  })
  .then(mkdata => {
      $('#marketSummary').append('<span class="card-title center-align">Market Information</span>')
      $('#marketSummary').append('<img class="custom-card-image" src="'+mkdata[0].image+'">')
      $('#marketSummary').append('<p><strong>'+mkdata[0].name+':</strong></p>')
      $('#marketSummary').append('<p> Current Price: $'+mkdata[0].current_price+'</p>')
      if (!mkdata[0].market_cap){
        $('#marketSummary').append('<p> Market Cap: N/A </p>')
      } else {
        $('#marketSummary').append('<p> Market Cap: '+mkdata[0].market_cap+'</p>')
      };
      if (!mkdata[0].market_cap_rank){
        $('#marketSummary').append('<p> Market Cap Rank: N/A </p>')
      } else {
        $('#marketSummary').append('<p> Market Cap Rank: '+mkdata[0].market_cap_rank+'</p>')
      }
      $('#marketSummary').append('<p> All Time High: $'+mkdata[0].ath+'</p>')
      $('#marketSummary').append('<p id="1h"> 1h Price Change: '+mkdata[0].price_change_percentage_1h_in_currency.toFixed(2)+'%</p>')
      $('#marketSummary').append('<p id="24h"> 24h Price Change: '+mkdata[0].price_change_percentage_24h_in_currency.toFixed(2)+'%</p>')
      $('#marketSummary').append('<p id="7d"> 7d Price Change: '+mkdata[0].price_change_percentage_7d_in_currency.toFixed(2)+'%</p>')

      if (mkdata[0].price_change_percentage_1h_in_currency.toFixed(2) < 0){
        $('#1h').addClass('goinDown')
    }else{
        $('#1h').addClass('goinUp')
    }
    if (mkdata[0].price_change_percentage_24h_in_currency.toFixed(2) < 0){
        $('#24h').addClass('goinDown')
    }else{
        $('#24h').addClass('goinUp')
    }
    if (mkdata[0].price_change_percentage_7d_in_currency.toFixed(2) < 0){
        $('#7d').addClass('goinDown')
    }else{
        $('#7d').addClass('goinUp')
    }
  })}

formEl1.addEventListener("submit", getMarketData1);

var formEl2 = document.getElementById("form2");
var btnEl2 = $("#btn2");

function getMarketData2 (event){
    event.preventDefault();
    $('#card2').removeClass('hide');
    $('#marketSummary2').html('');
    
    var mDT = $('#currency2-input').val();
    var mDTlower = mDT.toLowerCase();
    var mDTfinal = coinObjectRef[mDTlower];

    var marketDataURL2 ='https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids='+mDTfinal+ '&order=market_cap_desc%2Cvolume_desc&per_page=1&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d';

    fetch(marketDataURL2)
        .then(resm => {
      return resm.json();
         })
         .then(mkdata2 => {
        $('#marketSummary2').append('<span class="card-title center-align">Market Information</span>')
        $('#marketSummary2').append('<img class="custom-card-image" src="'+mkdata2[0].image+'">')
        $('#marketSummary2').append('<p><strong>'+mkdata2[0].name+':</strong></p>')
        $('#marketSummary2').append('<p> Current Price: $'+mkdata2[0].current_price+'</p>')
       
        if (!mkdata2[0].market_cap){
            $('#marketSummary2').append('<p> Market Cap: Information Not Available</p>')
        }else{
        $('#marketSummary2').append('<p> Market Cap: '+mkdata2[0].market_cap+'</p>')
        }
        if (!mkdata2[0].market_cap_rank){
            $('#marketSummary2').append('<p> Market Cap Rank: N/A</p>')
        }else{
            $('#marketSummary2').append('<p> Market Cap Rank: '+mkdata2[0].market_cap_rank+'</p>')
        }

        $('#marketSummary2').append('<p> All Time High: $'+mkdata2[0].ath+'</p>')
        $('#marketSummary2').append('<p id="1h2"> 1h Price Change: '+mkdata2[0].price_change_percentage_1h_in_currency.toFixed(2)+'%</p>')
        $('#marketSummary2').append('<p id="24h2"> 24h Price Change: '+mkdata2[0].price_change_percentage_24h_in_currency.toFixed(2)+'%</p>')
        $('#marketSummary2').append('<p id="7d2"> 7d Price Change: '+mkdata2[0].price_change_percentage_7d_in_currency.toFixed(2)+'%</p>')

        if (mkdata2[0].price_change_percentage_1h_in_currency.toFixed(2) < 0){
            $('#1h2').addClass('goinDown')
        }else{
            $('#1h2').addClass('goinUp')
        }
        if (mkdata2[0].price_change_percentage_24h_in_currency.toFixed(2) < 0){
            $('#24h2').addClass('goinDown')
        }else{
            $('#24h2').addClass('goinUp')
        }
        if (mkdata2[0].price_change_percentage_7d_in_currency.toFixed(2) < 0){
            $('#7d2').addClass('goinDown')
        }else{
            $('#7d2').addClass('goinUp')
        }
})}

formEl2.addEventListener("submit", getMarketData2,);



//code for creating top 7 list:

var trendingURL = "https://api.coingecko.com/api/v3/search/trending"

function generateTrending() {
    fetch(trendingURL)
    .then(res => res.json())
    .then(top7 => {
        for (let i = 0; i < top7.coins.length; i++){
            $('#trend').append('<li>' + top7.coins[i].item.name + '</li>')
        }
    })
};