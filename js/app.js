// Global variables, because everybody loves variables
var WEATHER_UPDATE_FREQ = 600000; // In milliseconds (every 10 minutes)
var TRANSIT_UPDATE_FREQ = 60000; // In milliseconds (every minute)

var updateWeather = function() {
	if (weatherDataStored()) {
		/** Set up a query string for weather underground **/
		var apiKey = localStorage.api;
		var zipCode = localStorage.zip;
		var queryString = "http://api.wunderground.com/api/" + apiKey + "/conditions/forecast/q/" + zipCode + ".json?callback=?";
		var date = new Date();
		var iconURL = "http://icons.wxug.com/i/c/j/";

		$.getJSON(queryString, function(data) {
			$("#temperature").html(data.current_observation.temp_f+'&deg;');
			$("#current-weather").html(data.current_observation.weather);
			$("#weather-icon").attr("src", iconURL + data.current_observation.icon + ".gif");
			$("#todays-forecast").html(data.forecast.txt_forecast.forecastday[0].fcttext);
			$("#todays-forecast-short").html(data.forecast.simpleforecast.forecastday[0].high.fahrenheit + "&deg;/" + data.forecast.simpleforecast.forecastday[0].low.fahrenheit + "&deg;");
			$("#todays-day").html(data.forecast.txt_forecast.forecastday[0].title);
			$("#todays-day-short").html(data.forecast.simpleforecast.forecastday[0].date.weekday_short + " " + data.forecast.simpleforecast.forecastday[0].date.ampm);
			$("#todays-icon").attr("src", iconURL + data.forecast.txt_forecast.forecastday[0].icon + ".gif");
			$("#tonights-forecast").html(data.forecast.txt_forecast.forecastday[1].fcttext);
			$("#tonights-forecast-short").html(data.forecast.simpleforecast.forecastday[1].high.fahrenheit + "&deg;/" + data.forecast.simpleforecast.forecastday[1].low.fahrenheit + "&deg;");
			$("#tonights-day").html(data.forecast.txt_forecast.forecastday[1].title);
			$("#tonights-day-short").html(data.forecast.simpleforecast.forecastday[1].date.weekday_short + " " + data.forecast.simpleforecast.forecastday[1].date.ampm);
			$("#tonights-icon").attr("src", iconURL + data.forecast.txt_forecast.forecastday[1].icon + ".gif");
			$("#tomorrows-forecast").html(data.forecast.txt_forecast.forecastday[2].fcttext);
			$("#tomorrows-forecast-short").html(data.forecast.simpleforecast.forecastday[2].high.fahrenheit + "&deg;/" + data.forecast.simpleforecast.forecastday[2].low.fahrenheit + "&deg;");
			$("#tomorrows-day").html(data.forecast.txt_forecast.forecastday[2].title);
			$("#tomorrows-day-short").html(data.forecast.simpleforecast.forecastday[2].date.weekday_short + " " + data.forecast.simpleforecast.forecastday[2].date.ampm);
			$("#tomorrows-icon").attr("src", iconURL + data.forecast.txt_forecast.forecastday[2].icon + ".gif");
			$("#weather-update-time").html("as of " + date.toLocaleTimeString());
		});
	}	
}

var updateTransit = function() {
	$.getJSON("cgi-bin/service_status.py", function(data) {
		var date = new Date();
		
		// $("#123-icon").html(data[0].name[0]);
		$("#123-status").html(data[0].status[0]);
		$("#123-text").html("<a class='close-reveal-modal'>&#215;</a>" + data[0].text[0]);
		// $("#BDFM-icon").html(data[4].name[0]);
		$("#BDFM-status").html(data[4].status[0]);
		$("#BDFM-text").html("<a class='close-reveal-modal'>&#215;</a>" + data[4].text[0]);
		// $("#NQR-icon").html(data[8].name[0]);
		$("#NQR-status").html(data[8].status[0]);
		$("#NQR-text").html("<a class='close-reveal-modal'>&#215;</a>" + data[8].text[0]);
		$("#transit-update-time").html("as of " + date.toLocaleTimeString());
	});
}

function populateSettingsForm() {
	$("#wuapikey").val(localStorage.api);
	$("#wuzip").val(localStorage.zip);
}

function weatherDataStored() {
	if ((localStorage.getItem("api") === null) || (localStorage.getItem("zip") === null)) {
		return false;
	} else {
		return true;
	}
}

function checkSettings() {
	if (!weatherDataStored()) {
		$("#no-settings-alert").show();
		$('#settings').foundation('reveal', 'open');
	} else {
		$("#no-settings-alert").attr("visibility", "hidden");
		$("#no-settings-alert").hide();
		return true;
	}
}
	
function updateSettings() {
	if ($("#wuapikey").val() && $("#wuzip").val()) {
		localStorage.api = $("#wuapikey").val();
		localStorage.zip = $("#wuzip").val();
	}
	if (weatherDataStored()) {
		$('#settings').foundation('reveal', 'close');
		$("#no-settings-alert").hide();
		updateWeather();
	}
}

function showSettings() {
	populateSettingsForm();
	$('#settings').foundation('reveal', 'open');
}

function show123Text() {
	$('#123-text').foundation('reveal', 'open');
}

function showBDFMText() {
	$('#BDFM-text').foundation('reveal', 'open');
}

function showNQRText() {
	$('#NQR-text').foundation('reveal', 'open');
}

function refreshPage() {
	date = new Date();
	// Update the weather information
	if ((!localStorage.getItem("lastWeatherUpdate")) || (Number(localStorage.lastWeatherUpdate) + WEATHER_UPDATE_FREQ < date.getTime())) {
		// Update weather!
		updateWeather();
		// Set the last update time
		localStorage.lastWeatherUpdate = date.getTime();
	}
	
	// Update the transit information
	if ((!localStorage.getItem("lastTransitUpdate")) || (Number(localStorage.lastTransitUpdate) + TRANSIT_UPDATE_FREQ < date.getTime())) {
		// Update transit!
		updateTransit();
		// Set the last update time
		localStorage.lastTransitUpdate = date.getTime();
	}
}

// Iniitialize the page
checkSettings();
updateWeather();
updateTransit();

// Refresh every second
setInterval(refreshPage, 1000);

