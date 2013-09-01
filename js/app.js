// Global variables, because everybody loves variables
var WEATHER_UPDATE_FREQ = 600000; // In milliseconds (every 10 minutes)
var TRANSIT_UPDATE_FREQ = 60000; // In milliseconds (every minute)

var updateWeather = function() {
	if (weatherDataStored()) {
		/** Set up a query string for weather underground **/
		var apiKey = localStorage.api;
		var zipCode = localStorage.zip;
		var queryString = "http://api.wunderground.com/api/" + apiKey + "/conditions/forecast/hourly/q/" + zipCode + ".json?callback=?";
		var date = new Date();
		var iconURL = "http://icons.wxug.com/i/c/j/";

		$.getJSON(queryString, function(data) {
			console.log(data);
			
			var forecasts = new Array();
			var forecastIndex = 0;
			
			$.each(data.hourly_forecast, function(i, v) {
			    if (v.FCTTIME.hour == "9" || v.FCTTIME.hour == "13" || v.FCTTIME.hour == "17") {
					if (forecastIndex < 3) {
						forecasts[forecastIndex] = v;
						forecastIndex++;
					} 
					else {
						return false;
					}
			    }
			});
			
			$("#temperature").html(data.current_observation.temp_f+'&deg;');
			$("#current-weather").html(data.current_observation.weather);
			$("#weather-icon").attr("src", iconURL + data.current_observation.icon + ".gif");
			$("#humidity-feel").html("Humidity " + data.current_observation.relative_humidity + ", feels like " + data.current_observation.feelslike_f + "&deg;");
			$("#first-forecast").html(forecasts[0].temp.english + "&deg; " + forecasts[0].condition);
			$("#first-forecast-short").html(forecasts[0].temp.english + "&deg;");
			$("#first-day-short").html(forecasts[0].FCTTIME.weekday_name_abbrev + " " + forecasts[0].FCTTIME.hour_padded + ":00");
			$("#first-icon").attr("src", iconURL + forecasts[0].icon + ".gif");
			$("#second-forecast").html(forecasts[1].temp.english + "&deg; " + forecasts[1].condition);
			$("#second-forecast-short").html(forecasts[1].temp.english + "&deg;");
			$("#second-day-short").html(forecasts[1].FCTTIME.weekday_name_abbrev + " " + forecasts[1].FCTTIME.hour_padded + ":00");
			$("#second-icon").attr("src", iconURL + forecasts[1].icon + ".gif");
			$("#third-forecast").html(forecasts[2].temp.english + "&deg; " + forecasts[2].condition);
			$("#third-forecast-short").html(forecasts[2].temp.english + "&deg;");
			$("#third-day-short").html(forecasts[2].FCTTIME.weekday_name_abbrev + " " + forecasts[2].FCTTIME.hour_padded + ":00");
			$("#third-icon").attr("src", iconURL + forecasts[2].icon + ".gif");
			$("#weather-update-time").html("as of " + date.toLocaleTimeString());
		});
	}	
}

var updateTransit = function() {
	$.getJSON("cgi-bin/service_status.py", function(data) {
		var date = new Date();
		
		$("#123-icon").attr("alt", data[0].name[0]);
		$("#123-status").html(data[0].status[0].toLowerCase());
		$("#123-status").attr("class", data[0].status[0].replace(' ','-').toLowerCase());
		$("#123-text").html("<a class='close-reveal-modal'>&#215;</a>" + data[0].text[0]);
		if (data[0].status[0] == "GOOD SERVICE") {
			$("#123-status").attr("onClick", "");
		} else {
			$("#123-status").attr("onClick", "show123Text();");
		}
		
		$("#BDFM-icon").attr("alt", data[4].name[0]);
		$("#BDFM-status").html(data[4].status[0].toLowerCase());
		$("#BDFM-status").attr("class", data[4].status[0].replace(' ','-').toLowerCase());
		$("#BDFM-text").html("<a class='close-reveal-modal'>&#215;</a>" + data[4].text[0]);
		if (data[4].status[0] == "GOOD SERVICE") {
			$("#BDFM-status").attr("onClick", "");
		} else {
			$("#BDFM-status").attr("onClick", "showBDFMText();");
		}
		
		$("#NQR-icon").attr("alt", data[8].name[0]);
		$("#NQR-status").html(data[8].status[0].toLowerCase());
		$("#NQR-status").attr("class", data[8].status[0].replace(' ','-').toLowerCase());
		$("#NQR-text").html("<a class='close-reveal-modal'>&#215;</a>" + data[8].text[0]);
		$("#transit-update-time").html("as of " + date.toLocaleTimeString());
		if (data[8].status[0] == "GOOD SERVICE") {
			$("#NQR-status").attr("onClick", "");
		} else {
			$("#NQR-status").attr("onClick", "showNQRText();");
		}
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

